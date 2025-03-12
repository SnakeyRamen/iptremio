const express = require('express');
const router = express.Router();
const config = require('../config');
const configMiddleware = require('../middleware/configMiddleware');
const xtreamClientMiddleware = require('../middleware/xtreamClientMiddleware');

router.get('/:config/manifest.json', configMiddleware, xtreamClientMiddleware, async (req, res) => {
    try {
        const client = req.xtreamClient;
        const manifestName = config.isDev
            ? `[DEV] [${client.config.host}] IPTremio`
            : `[${client.config.host}] IPTremio`;

        const manifest = {
            id: 'ext.iptremio',
            version: '1.0.0',
            name: manifestName,
            description: 'Watch Xtream-codes content on Stremio',
            resources: ['stream'],
            types: ['movie', 'series'],
            idPrefixes: ['iptremio:', 'tt'],
            catalogs: [],
            behaviorHints: {
                configurable: false,
                configurationRequired: false
            }
        };

        return res.json(manifest);
    } catch (error) {
        return res.status(500).json({
            id: 'org.iptremio',
            version: '1.0.0',
            name: 'iptremio [ERROR]',
            description: 'Error loading manifest',
            resources: ['stream'],
            types: ['movie', 'series'],
            catalogs: []
        });
    }
});

module.exports = router;
