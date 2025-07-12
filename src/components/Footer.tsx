import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-primary mb-4">Shopify</h3>
            <p className="text-sm text-muted-foreground">
              Community-driven shopping made simple. Discover local shops and connect with fellow shoppers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/discover" className="hover:text-foreground">Discover Products</Link></li>
              <li><Link to="/map" className="hover:text-foreground">Find Shops</Link></li>
              <li><Link to="/favorites" className="hover:text-foreground">My Favorites</Link></li>
              <li><Link to="/orders" className="hover:text-foreground">Order History</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Vendors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/vendor/register" className="hover:text-foreground">Become a Vendor</Link></li>
              <li><Link to="/vendor/dashboard" className="hover:text-foreground">Vendor Portal</Link></li>
              <li><Link to="/help/vendor" className="hover:text-foreground">Vendor Guide</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Shopify PWA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;