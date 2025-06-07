
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, Navigation, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { formatCedi } from '@/lib/utils';

interface ShippingData {
  deliveryType: 'delivery' | 'pickup';
  fullName: string;
  phone: string;
  address: string;
  gpsAddress: string;
  coordinates: [number, number] | null;
  shippingFee: number;
  region: string;
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Accra Makola coordinates
const MAKOLA_COORDINATES: [number, number] = [-0.2074, 5.5500];

// Shipping regions with base fees (in GHS)
const SHIPPING_REGIONS = {
  'Greater Accra': { baseFee: 5, maxDistance: 50 },
  'Ashanti': { baseFee: 15, maxDistance: 300 },
  'Western': { baseFee: 20, maxDistance: 400 },
  'Central': { baseFee: 18, maxDistance: 200 },
  'Eastern': { baseFee: 12, maxDistance: 150 },
  'Northern': { baseFee: 35, maxDistance: 600 },
  'Upper East': { baseFee: 40, maxDistance: 700 },
  'Upper West': { baseFee: 42, maxDistance: 750 },
  'Volta': { baseFee: 22, maxDistance: 300 },
  'Brong Ahafo': { baseFee: 25, maxDistance: 350 }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateShippingFee = (coordinates: [number, number]): { fee: number; region: string } => {
  const distance = calculateDistance(
    MAKOLA_COORDINATES[1], MAKOLA_COORDINATES[0],
    coordinates[1], coordinates[0]
  );

  // Find the appropriate region based on distance
  let selectedRegion = 'Greater Accra';
  let baseFee = SHIPPING_REGIONS['Greater Accra'].baseFee;

  for (const [region, config] of Object.entries(SHIPPING_REGIONS)) {
    if (distance <= config.maxDistance) {
      selectedRegion = region;
      baseFee = config.baseFee;
      break;
    }
  }

  // Add distance-based surcharge (₵0.50 per km over 20km)
  const distanceSurcharge = distance > 20 ? (distance - 20) * 0.5 : 0;
  const totalFee = baseFee + distanceSurcharge;

  return {
    fee: Math.round(totalFee * 100) / 100, // Round to 2 decimal places
    region: selectedRegion
  };
};

const ShippingForm: React.FC<ShippingFormProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<Partial<ShippingData>>({
    deliveryType: 'delivery',
    fullName: '',
    phone: '',
    address: '',
    gpsAddress: '',
    coordinates: null,
    shippingFee: 0,
    region: ''
  });

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map - using a placeholder token, user should replace with their own
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: MAKOLA_COORDINATES,
      zoom: 10
    });

    // Add Makola market marker
    new mapboxgl.Marker({ color: '#f97316' })
      .setLngLat(MAKOLA_COORDINATES)
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Makola Market</h3><p>Our main location</p>'))
      .addTo(map.current);

    // Add click event to map
    map.current.on('click', (e) => {
      const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      // Add new marker
      marker.current = new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat(coordinates)
        .addTo(map.current!);

      // Calculate shipping fee
      const { fee, region } = calculateShippingFee(coordinates);

      setFormData(prev => ({
        ...prev,
        coordinates,
        shippingFee: fee,
        region,
        gpsAddress: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`
      }));

      toast.success(`Location selected! Shipping fee: ${formatCedi(fee)}`);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        marker.current = new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat(coordinates)
          .addTo(map.current!);

        // Center map on location
        map.current?.flyTo({ center: coordinates, zoom: 14 });

        // Calculate shipping fee
        const { fee, region } = calculateShippingFee(coordinates);

        setFormData(prev => ({
          ...prev,
          coordinates,
          shippingFee: fee,
          region,
          gpsAddress: `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`
        }));

        toast.success(`Current location detected! Shipping fee: ${formatCedi(fee)}`);
      },
      (error) => {
        toast.error('Unable to get your location');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    if (formData.deliveryType === 'delivery') {
      if (!formData.address || !formData.coordinates) {
        toast.error('Please provide your address and select location on map');
        return;
      }
    }

    onSubmit(formData as ShippingData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Shipping Information</h2>
        <p className="text-gray-600">Please provide your details for delivery or pickup</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Delivery Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Delivery Option</Label>
          <RadioGroup
            value={formData.deliveryType}
            onValueChange={(value: 'delivery' | 'pickup') => 
              setFormData(prev => ({ ...prev, deliveryType: value }))
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery">Home Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup">Pickup from Makola Market</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0XX XXX XXXX"
              required
            />
          </div>
        </div>

        {/* Delivery Information */}
        {formData.deliveryType === 'delivery' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your street address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsAddress">GPS Coordinates</Label>
              <div className="flex gap-2">
                <Input
                  id="gpsAddress"
                  value={formData.gpsAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpsAddress: e.target.value }))}
                  placeholder="Click on map or use current location"
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="shrink-0"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Current Location
                </Button>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-2">
              <Label>Select Delivery Location on Map</Label>
              <div className="relative">
                <div 
                  ref={mapContainer} 
                  className="w-full h-64 rounded-lg border"
                  style={{ minHeight: '256px' }}
                />
                <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Makola Market (Our Store)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Your Location</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Click anywhere on the map to set your delivery location
              </p>
            </div>

            {/* Shipping Fee Display */}
            {formData.coordinates && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-green-800">Shipping Calculation</h4>
                    <p className="text-sm text-green-600">
                      Region: {formData.region}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-800">
                      {formatCedi(formData.shippingFee || 0)}
                    </p>
                    <p className="text-sm text-green-600">Shipping Fee</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pickup Information */}
        {formData.deliveryType === 'pickup' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Pickup Location</h4>
                <p className="text-sm text-blue-600">
                  Makola Market, Accra<br />
                  We'll contact you when your order is ready for pickup
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;
