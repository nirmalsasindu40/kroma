import express from 'express';
import FAQ from '../models/FAQ.js';
import Feedback from '../models/Feedback.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const exampleFaqs = [
  {
    question: 'Can I personalise a product with my own design?',
    answer: 'Yes. Choose a product, upload your photo or artwork, and preview your design before placing an order.',
  },
  {
    question: 'What file types can I use for my design?',
    answer: 'For the clearest print, use a high-resolution PNG or JPEG image. Make sure you have permission to use any artwork you upload.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery time depends on your location and the product. We will share the latest order and delivery updates with you after checkout.',
  },
  {
    question: 'Can I change or cancel an order?',
    answer: 'Contact our team as soon as possible with your order details. Custom products may not be changeable once printing has started.',
  },
];

let faqInitialization;

async function getFaqs() {
  let faqs = await FAQ.find().sort({ createdAt: 1 });
  if (faqs.length > 0) return faqs;

  if (!faqInitialization) {
    faqInitialization = FAQ.insertMany(exampleFaqs).finally(() => {
      faqInitialization = null;
    });
  }
  await faqInitialization;
  faqs = await FAQ.find().sort({ createdAt: 1 });
  return faqs;
}

router.get('/faqs', async (req, res) => {
  try {
    res.json(await getFaqs());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/faqs', protect, adminOnly, async (req, res) => {
  try {
    const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
    const answer = typeof req.body.answer === 'string' ? req.body.answer.trim() : '';
    if (!question || !answer) {
      return res.status(400).json({ message: 'A question and answer are required.' });
    }
    const faq = await FAQ.create({ question, answer });
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/faqs/:id', protect, adminOnly, async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.question === 'string') update.question = req.body.question.trim();
    if (typeof req.body.answer === 'string') update.answer = req.body.answer.trim();
    if (!update.question || !update.answer) {
      return res.status(400).json({ message: 'A question and answer are required.' });
    }
    const faq = await FAQ.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!faq) return res.status(404).json({ message: 'Q&A not found.' });
    res.json(faq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).limit(100);
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    const rating = Number(req.body.rating);
    if (!name || !message || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Enter your name, a review, and a rating from 1 to 5 stars.' });
    }
    const feedback = await Feedback.create({ name, message, rating });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
