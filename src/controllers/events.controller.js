const queue = require('../services/eventQueue.service');
exports.next = async (req, res, next) => { try { res.json({ event: await queue.next(req.connection.clinic_id) }); } catch (e) { next(e); } };
exports.acknowledge = async (req, res, next) => { try { const ok = await queue.acknowledge(req.params.id, req.connection.clinic_id); res.status(ok ? 200 : 404).json({ acknowledged: ok }); } catch (e) { next(e); } };
