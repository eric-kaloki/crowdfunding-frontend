export const TermsContent = () => {
    return (
      <div className="p-6 bg-gray-100 text-gray-900">
        <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p>Welcome to Trancends Corp ("Company," "we," "our," or "us"). By accessing or using our platform ("Services"), you agree to comply with and be bound by these Terms and Conditions ("Terms"). If you do not agree with these Terms, please do not use our Services.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Definitions</h2>
          <ul className="list-disc ml-6">
            <li><strong>Client</strong>: The individual or organization using the platform to request software development services.</li>
            <li><strong>Developer</strong>: The Company or its designated employees and contractors who provide development services.</li>
            <li><strong>Deliverables</strong>: The source code, designs, and related materials provided to the Client upon completion of a project.</li>
            <li><strong>Platform</strong>: The website and associated tools operated by the Company to facilitate service requests.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. Eligibility</h2>
          <p>You must be at least 18 years old and legally capable of entering into contracts under the laws of Kenya to use our Services. By using our platform, you represent and warrant that you meet these requirements.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Services Provided</h2>
          <ul className="list-disc ml-6">
            <li>The platform allows Clients to submit project descriptions, specify budgets, and choose payment structures.</li>
            <li>Development is based on the provided project description and budget agreement.</li>
            <li>Deliverables are released upon full payment completion.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">5. Registration and Accounts</h2>
          <ul className="list-disc ml-6">
            <li>Clients must register an account to use the platform.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate, current, and complete information during registration.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">6. Project Submission</h2>
          <ul className="list-disc ml-6">
            <li>Clients can submit project requests with clear descriptions, desired features, budgets, and timelines.</li>
            <li>The Company reserves the right to accept, reject, or request modifications to submitted projects.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">7. Payment Terms</h2>
          <ul className="list-disc ml-6">
            <li>Payment structures will be outlined and agreed upon before project initiation.</li>
            <li>Payments must be made through approved methods specified on the platform.</li>
            <li>Deliverables will only be released after full payment has been received.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">8. Intellectual Property</h2>
          <ul className="list-disc ml-6">
            <li>All intellectual property rights in Deliverables will be transferred to the Client upon full payment.</li>
            <li>The Company retains the right to use generic, non-identifiable elements of Deliverables for portfolio purposes.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">9. Confidentiality</h2>
          <ul className="list-disc ml-6">
            <li>Both parties agree to maintain the confidentiality of proprietary information shared during the project.</li>
            <li>The Company will not share Client-provided information with third parties without explicit consent.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">10. Warranties and Limitations of Liability</h2>
          <ul className="list-disc ml-6">
            <li>The Company warrants that Deliverables will conform to agreed-upon specifications.</li>
            <li>The Company is not liable for indirect, incidental, or consequential damages resulting from the use of Deliverables.</li>
            <li>The Company makes no guarantees about the fitness of Deliverables for purposes other than those explicitly specified in the project.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">11. Termination</h2>
          <ul className="list-disc ml-6">
            <li>Either party may terminate a project agreement if the other party breaches these Terms.</li>
            <li>Upon termination, all unfinished work will remain the property of the Company until payment for completed portions is made.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">12. Dispute Resolution</h2>
          <ul className="list-disc ml-6">
            <li>Any disputes arising under these Terms will first be resolved through negotiation between the parties.</li>
            <li>If unresolved, disputes will be subject to arbitration in accordance with the Arbitration Act of Kenya, 1995 (as amended).</li>
            <li>The arbitration process shall take place in Kenya, and the decision of the arbitrator(s) shall be final and binding on both parties.</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">13. Amendments</h2>
          <p>The Company reserves the right to modify these Terms at any time. Clients will be notified of significant changes, and continued use of the platform constitutes acceptance of modified Terms.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">14. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of Kenya. Any legal actions arising out of these Terms shall be brought before the competent courts of Kenya.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">15. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at   {" "}
            <a
              className="text-blue-500 underline"
              href="mailto:transcends.corp@gmail.com"
            >
            Customer Support
            </a>
            .
          </p>
        </section>
      </div>
    );
  };

