
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler, AlertCircle } from 'lucide-react';

const SizeGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Size Guide</h1>
            <p className="text-lg text-gray-600">
              Find your perfect fit with our comprehensive size guide for men's footwear.
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {/* Men's Shoes Size Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-brand-orange" />
                  Men's Shoe Size Chart
                </CardTitle>
                <CardDescription>
                  Measurements in centimeters (cm) - foot length
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UK Size</TableHead>
                        <TableHead>US Size</TableHead>
                        <TableHead>EU Size</TableHead>
                        <TableHead>Foot Length (cm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>6</TableCell>
                        <TableCell>7</TableCell>
                        <TableCell>40</TableCell>
                        <TableCell>25.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>7</TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>41</TableCell>
                        <TableCell>25.5</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>8</TableCell>
                        <TableCell>9</TableCell>
                        <TableCell>42</TableCell>
                        <TableCell>26.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>9</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>43</TableCell>
                        <TableCell>27.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>10</TableCell>
                        <TableCell>11</TableCell>
                        <TableCell>44</TableCell>
                        <TableCell>28.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>11</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>45</TableCell>
                        <TableCell>29.0</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>12</TableCell>
                        <TableCell>13</TableCell>
                        <TableCell>46</TableCell>
                        <TableCell>30.0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* How to Measure */}
            <Card>
              <CardHeader>
                <CardTitle>How to Measure Your Feet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Step-by-Step Instructions:</h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="font-semibold">1.</span>
                        <span>Place a piece of paper on a hard floor against a wall.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">2.</span>
                        <span>Stand on the paper with your heel against the wall.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">3.</span>
                        <span>Mark the tip of your longest toe on the paper.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">4.</span>
                        <span>Measure the distance from the wall to the mark.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold">5.</span>
                        <span>Repeat for both feet and use the larger measurement.</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Important Tips:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Measure your feet in the evening when they're at their largest.</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Wear the type of socks you plan to wear with the shoes.</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>If you're between sizes, we recommend choosing the larger size.</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span>Different shoe styles may fit differently.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Width Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Width Guide</CardTitle>
                <CardDescription>Understanding shoe width for the perfect fit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Narrow (B)</h4>
                    <p className="text-gray-600">For feet that are narrower than average</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Standard (D)</h4>
                    <p className="text-gray-600">Most common width, fits average feet</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Wide (E/EE)</h4>
                    <p className="text-gray-600">For feet that are wider than average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="border-brand-orange/20 bg-orange-50">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertCircle className="h-5 w-5 text-brand-orange mt-0.5" />
                <div>
                  <h3 className="font-semibold text-brand-orange mb-1">Need Help Finding Your Size?</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    If you're unsure about sizing or need additional assistance, our customer service team is here to help.
                  </p>
                  <p className="text-sm">
                    Contact us at: <strong>saffiretech01@gmail.com</strong>
                  </p>
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

export default SizeGuide;
