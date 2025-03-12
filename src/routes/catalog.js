const express = require('express');
const router = express.Router();
const configMiddleware = require('../middleware/configMiddleware');
const xtreamClientMiddleware = require('../middleware/xtreamClientMiddleware');

router.get('/:config/catalog/:type/:id.json', configMiddleware, xtreamClientMiddleware, handleCatalogRequest);

async function handleCatalogRequest(req, res) {
    try {
        const { type, id } = req.params;
        const client = req.xtreamClient;

        const response = await client.updateCatalog(type);

        return res.json({ metas: response });
    } catch (error) {
        console.error('[Catalog] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch catalog', metas: [] });
    }
}

module.exports = router;
