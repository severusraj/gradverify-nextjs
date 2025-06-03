'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailToken } from '@/actions/verify.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        return;
      }

      try {
        const result = await verifyEmailToken(token);
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email verified successfully! You can now log in.');
          if (result.redirectUrl) {
            setTimeout(() => router.push(result.redirectUrl), 2000);
          }
        } else {
          setStatus('error');
          setMessage(result.message || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            <p className="text-center text-gray-600">{message}</p>
            {status !== 'loading' && (
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                {status === 'success' ? 'Go to Login' : 'Try Again'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 