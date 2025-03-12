const express = require('express');
const router = express.Router();
const config = require('../config');
const configMiddleware = require('../middleware/configMiddleware');
const xtreamClientMiddleware = require('../middleware/xtreamClientMiddleware');

/**
 * GET /:config/manifest.json
 * Generates and returns the Stremio manifest
 */
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
            resources: ['stream'], // Removed 'meta'
            types: ['movie', 'series'], // Removed 'tv'
            idPrefixes: ['iptremio:', 'tt'],
        };

        return res.json(manifest);
    } catch (error) {
        console.error('[Manifest] Error:', error.message);

        return res.status(500).json({
            id: 'org.iptremio',
            version: '1.0.0',
            name: 'iptremio [ERROR]',
            description: 'Error loading manifest',
            resources: ['stream'], // Removed 'meta'
            types: ['movie', 'series'], // Removed 'tv'
        });
    }
});

module.exports = router;
