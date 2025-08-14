import React from 'react';
import MenuNavBar from './MenuNavBar';
import styles from '../styles/Contacts.module.css';

const Contacts = () => {
  return (
    <div>
      <MenuNavBar title={'Contact & FAQs'} />

      <div className={styles.contentWrapper}>
      
        <section className={styles.section}>
          <p>If you have any questions or need support, feel free to reach out:</p>
          <ul>
            <li><strong>Email:</strong> support@mingleme.com</li>
            <li><strong>Phone:</strong> +977-9800000000</li>
            <li><strong>Office:</strong> 123 Mingle Street, Kathmandu</li>
          </ul>
        </section>

        <hr className={styles.divider} />

        {/* FAQ Section */}
        <section className={styles.section}>
          <h2>FAQs</h2>

          <div className={styles.faqItem}>
            <h3>How does matching work?</h3>
            <p>Matching is based on your preferences and location.</p>
          </div>

          <hr className={styles.faqDivider} />

          <div className={styles.faqItem}>
            <h3>How can I report a user?</h3>
            <p>You can report from their profile or chat screen.</p>
          </div>

          <hr className={styles.faqDivider} />

          <div className={styles.faqItem}>
            <h3>Are my messages private?</h3>
            <p>Yes, all chats are encrypted end-to-end.</p>
          </div>

          <hr className={styles.faqDivider} />

          <div className={styles.faqItem}>
            <h3>Can I delete my account?</h3>
            <p>Yes, you can delete your account anytime in settings.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contacts;
