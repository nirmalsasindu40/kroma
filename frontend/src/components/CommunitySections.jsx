import { useEffect, useState } from 'react';
import { getFaqs, getFeedback, submitFeedback } from '../services/communityApi';

function Stars({ rating, interactive = false, onSelect }) {
  return (
    <span className={`review-stars${interactive ? ' review-stars-interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        interactive ? (
          <button
            key={star}
            type="button"
            className={star <= rating ? 'selected' : ''}
            onClick={() => onSelect(star)}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-pressed={rating === star}
          >
            ★
          </button>
        ) : (
          <span key={star} className={star <= rating ? 'selected' : ''} aria-hidden="true">
            ★
          </span>
        )
      ))}
    </span>
  );
}

export default function CommunitySections() {
  const [faqs, setFaqs] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqError, setFaqError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getFaqs(), getFeedback()]).then(([faqResult, feedbackResult]) => {
      if (!active) return;
      if (faqResult.status === 'fulfilled') {
        setFaqs(faqResult.value);
      } else {
        setFaqError(faqResult.reason.message);
      }
      if (feedbackResult.status === 'fulfilled') {
        setFeedback(feedbackResult.value);
      } else {
        setFeedbackError(feedbackResult.reason.message);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    if (rating < 1 || rating > 5) {
      setFormError('Please choose a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitFeedback({ name, message, rating });
      setFeedback((current) => [created, ...current].slice(0, 100));
      setName('');
      setMessage('');
      setRating(0);
      setSuccess('Thanks for sharing your feedback!');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="section community-faq" id="faq">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Need to know</p>
              <h2>Questions &amp; answers</h2>
            </div>
          </div>

          {faqError && <p className="community-error">Couldn't load questions: {faqError}</p>}
          {loading ? (
            <p>Loading questions...</p>
          ) : (
            <div className="faq-list">
              {faqs.map((faq) => (
                <details className="faq-item" key={faq._id}>
                  <summary>{faq.question}<span aria-hidden="true">+</span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
              {!faqs.length && !faqError && <p>No questions have been added yet.</p>}
            </div>
          )}
        </div>
      </section>

      <section className="section community-feedback" id="feedback">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Made by you</p>
              <h2>Customer feedback</h2>
            </div>
            <p className="feedback-intro">Your experience helps our community shop with confidence.</p>
          </div>

          <div className="feedback-layout">
            <div className="feedback-list">
              {feedbackError && <p className="community-error">Couldn't load customer feedback: {feedbackError}</p>}
              {loading ? (
                <p>Loading customer feedback...</p>
              ) : feedback.length ? (
                feedback.map((item) => (
                  <article className="feedback-card" key={item._id}>
                    <Stars rating={item.rating} />
                    <p className="feedback-message">{item.message}</p>
                    <div className="feedback-byline">
                      <strong>{item.name}</strong>
                      <time dateTime={item.createdAt}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </article>
                ))
              ) : feedbackError ? null : (
                <div className="feedback-empty">
                  <p>No reviews yet. Be the first to share your experience.</p>
                </div>
              )}
            </div>

            <form className="feedback-form" onSubmit={handleSubmit}>
              <div>
                <p className="eyebrow">Your voice matters</p>
                <h3>Write a review</h3>
              </div>
              <label>
                Your name
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="How should we credit you?"
                />
              </label>
              <fieldset className="feedback-rating">
                <legend>Your rating</legend>
                <Stars rating={rating} interactive onSelect={setRating} />
              </fieldset>
              <label>
                Your feedback
                <textarea
                  required
                  maxLength={1000}
                  rows="5"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Tell us what you think..."
                />
              </label>
              {formError && <p className="community-error" role="alert">{formError}</p>}
              {success && <p className="community-success" role="status">{success}</p>}
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit feedback'}
              </button>
              <p className="feedback-note">Customer feedback is shared as submitted and cannot be edited by the store admin.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
