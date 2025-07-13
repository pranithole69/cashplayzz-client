import React from "react";
import "./App.css";

function Agreement({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="agreement-modal" onClick={(e) => e.stopPropagation()}>
        <h2>User Agreement</h2>

        <p>
          This User Agreement ("Agreement") governs your use of the <strong>CashPlayzz</strong> platform.
          By accessing, registering, or using this service, you agree to the terms set forth below.
          If you do not agree, you must not use our services.
        </p>

        <ul style={{ textAlign: "left", marginTop: "15px" }}>
          <li><strong>Eligibility:</strong> You must be at least 18 years old and legally allowed to participate in skill-based or real-money games under your local laws.</li>
          <li><strong>Risk Warning:</strong> All games involve financial risk and may be addictive. Please play responsibly. You accept full responsibility for your actions and potential losses.</li>
          <li><strong>Account Policy:</strong> Only one account per individual is allowed. Multiple or fake accounts will be permanently banned without notice.</li>
          <li><strong>Anti-Fraud:</strong> Use of any bots, automated tools, or cheating methods is strictly prohibited and will lead to permanent suspension and legal action.</li>
          <li><strong>Data Usage:</strong> We collect certain personal and gameplay data to provide services and improve user experience, as outlined in our Privacy Policy.</li>
          <li><strong>Withdrawal Rules:</strong> Withdrawals are subject to KYC verification, minimum wagering requirements, and internal approval systems to prevent fraud.</li>
          <li><strong>Fair Play:</strong> Game logic is built on fairness and chance. All outcomes are monitored and audited for transparency.</li>
          <li><strong>Jurisdiction:</strong> This Agreement shall be governed by the laws of India. Any legal disputes shall fall under the exclusive jurisdiction of the courts in Maharashtra.</li>
        </ul>

        <p className="sub-info" style={{ marginTop: "15px", fontSize: "14px", opacity: 0.8 }}>
          By continuing to use CashPlayzz, you confirm that you have read, understood, and agreed to all of the above terms.
        </p>

        <button className="modal-btn" onClick={onClose}>
          I Agree & Close
        </button>
      </div>
    </div>
  );
}

export default Agreement;
