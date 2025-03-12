const axios = require("axios");
const database = require("./database");
const { Stream } = require("../models");

class XtreamClient {
    constructor(config) {
        if (!config) {
            throw new Error("Config is required to initialize XtreamClient");
        }
        this.config = config;
        this.userId = config.getHash();
        this.axiosInstance = axios.create({ timeout: 20000 });
    }

    async _getApiData(action, params = {}) {
        const url = new URL(`http://${this.config.host}:${this.config.port}/player_api.php`);
        url.searchParams.append("username", this.config.username);
        url.searchParams.append("password", this.config.password);
        url.searchParams.append("action", action);
        
        for (const [key, val] of Object.entries(params)) {
            url.searchParams.append(key, val);
        }

        try {
            const resp = await this.axiosInstance.get(url.toString());
            return resp.data;
        } catch (err) {
            console.error(`[XtreamClient] Error calling ${action}:`, err.message);
            throw err;
        }
    }

    async updateCatalog(type) {
        const collectionName = type === "movie" ? "movie_catalog" : "series_catalog";

        const existing = await database.findMany(collectionName, { userId: this.userId });

        if (existing.length) {
            return existing;
        }

        const action = type === "movie" ? "get_vod_streams" : "get_series";
        const data = await this._getApiData(action);

        if (!Array.isArray(data)) {
            return [];
        }

        const items = data
            .filter(item => item.name.startsWith('EN')) // Only keep English content
            .map(item => new Stream({
                id: item.tmdb ? `tt${item.tmdb}` : `iptremio:${item.stream_id}`,
                type,
                name: item.name,
                poster: item.stream_icon || item.cover || "",
                description: item.plot || "",
                internalId: item.stream_id,
                tmdbRaw: item.tmdb || "",
                releaseDate: item.releaseDate || "",
                rating: item.rating || "",
                genre: item.genre || "",
            }));

        await database.insertMany(collectionName, items.map(item => ({ userId: this.userId, ...item })));
        await database.createIndex(collectionName, { name: "text" });

        return true;
    }

    async getStreams(type, id, baseUrl) {
        if (!type || !id) return [];
        await this.updateCatalog(type);

        const collectionName = type === "movie" ? "movie_catalog" : "series_catalog";
        const candidateDocs = await database.findMany(collectionName, {
            userId: this.userId,
            $text: { $search: id }
        });

        return type === "movie"
            ? this._buildMovieStreams(candidateDocs, baseUrl)
            : this._buildSeriesStreams(candidateDocs, id, baseUrl);
    }

    _buildMovieStreams(matchingItems, baseUrl) {
        return matchingItems.map(item => ({
            title: item.name,
            url: `${baseUrl}/redirect/movie/${item.internalId}`,
        }));
    }

    _buildSeriesStreams(matchingItems, fullId, baseUrl) {
        return matchingItems.map(item => ({
            title: item.name,
            url: `${baseUrl}/redirect/series/${item.internalId}`,
        }));
    }
}

module.exports = { XtreamClient };
