import express from 'express';
import Event from '../models/Event.js';
import { categorizeEvent } from '../services/openaiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const category = await categorizeEvent(title, description);

    const event = new Event({ title, description, date, category });
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
