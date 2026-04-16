// components/Footer.js

function Footer() {
  return (
    <footer className="bg-dark-bg text-dark-textMuted py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-medium">&copy; 2024 DealHub. All rights reserved.</p>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="hover:text-brand-400 transition-colors">Contact Us</a>
          <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
