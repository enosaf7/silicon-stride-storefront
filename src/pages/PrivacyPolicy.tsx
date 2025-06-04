
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Mail, Phone, User } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-orange" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-600 mb-2">When you create an account or make a purchase, we may collect:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Name and contact information (email, phone number)</li>
                    <li>• Shipping and billing addresses</li>
                    <li>• Payment information (processed securely by our payment partners)</li>
                    <li>• Order history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Automatically Collected Information</h3>
                  <p className="text-sm text-gray-600 mb-2">When you visit our website, we may automatically collect:</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Browser type and version</li>
                    <li>• Device information</li>
                    <li>• IP address and location data</li>
                    <li>• Pages visited and time spent on our site</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">We use the information we collect to:</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Process and fulfill your orders</li>
                  <li>• Provide customer service and support</li>
                  <li>• Send order confirmations and shipping updates</li>
                  <li>• Improve our products and services</li>
                  <li>• Prevent fraud and ensure security</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Send promotional communications (with your consent)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> With trusted partners who help us operate our business (payment processors, shipping companies, etc.)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, sale, or transfer of our business</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-orange" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Secure Socket Layer (SSL) encryption for data transmission</li>
                  <li>• Regular security assessments and updates</li>
                  <li>• Limited access to personal information on a need-to-know basis</li>
                  <li>• Secure payment processing through trusted providers</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">You have the right to:</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Access and update your personal information</li>
                  <li>• Request deletion of your account and data</li>
                  <li>• Opt out of promotional communications</li>
                  <li>• Request a copy of your personal data</li>
                  <li>• Lodge a complaint with relevant authorities</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
                </p>
                <p className="text-sm text-gray-600">
                  By continuing to use our website, you consent to our use of cookies in accordance with this policy.
                </p>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the updated policy on our website with a new effective date.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-brand-orange/20 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-orange">
                  <Mail className="h-5 w-5" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> saffiretech01@gmail.com</p>
                  <p><strong>Business Name:</strong> JE's Palace</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
