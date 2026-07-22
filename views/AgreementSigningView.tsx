import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { agreementService } from '../services/agreementService';
import { pdfService } from '../services/pdfService';
import { Shield, CheckCircle, FileText, Smartphone, Lock, AlertCircle } from 'lucide-react';
import { Agreement, MovieProject } from '../types';
import { supabase } from '../supabase';

interface AgreementSigningViewProps {
  agreementId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AgreementSigningView: React.FC<AgreementSigningViewProps> = ({
  agreementId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [project, setProject] = useState<MovieProject | null>(null);
  
  const [step, setStep] = useState<'preview' | 'otp_request' | 'otp_verify' | 'processing' | 'success'>('preview');
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch Agreement
        const { data: agrData, error: agrError } = await supabase
          .from('agreements')
          .select('*')
          .eq('id', agreementId)
          .single();
          
        if (agrError) throw agrError;
        setAgreement(agrData);

        if (agrData.status === 'signed') {
          setStep('success');
        }

        // Fetch Project
        if (agrData.project_id) {
          const { data: projData, error: projError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', agrData.project_id)
            .single();
          if (projError) throw projError;
          setProject(projData);
        }
      } catch (err: any) {
        console.error('Error fetching agreement:', err);
        setError('Could not load agreement details.');
      } finally {
        setLoading(false);
      }
    };

    if (agreementId && user) {
      fetchDetails();
    }
  }, [agreementId, user]);

  const handleRequestOTP = async () => {
    if (!agreed) {
      setError('You must agree to the terms to proceed.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await agreementService.sendEmailOTP(user!.email);
      setStep('otp_verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSign = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      setStep('processing');

      // Gather device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        browser: navigator.vendor,
        os: navigator.platform,
      };

      // Create signature details for PDF
      const sigDetails = {
        signed_at: new Date().toISOString(),
        ip_address: 'Logged via secure session',
        browser_info: deviceInfo.userAgent,
        hash_id: '' // Will update after PDF generation
      };

      // Generate PDF
      const pdfBlob = await pdfService.generateAgreementPDF(
        agreement!,
        user!,
        project!,
        sigDetails
      );

      // Generate hash of PDF
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const hashInput = new Uint8Array(arrayBuffer).toString();
      const hashId = agreementService.generateHash(hashInput);
      sigDetails.hash_id = hashId;

      // Re-generate PDF with actual hash (in reality we hash content, but for simplicity here)
      const finalPdfBlob = await pdfService.generateAgreementPDF(
        agreement!,
        user!,
        project!,
        sigDetails
      );

      // Upload PDF
      const pdfUrl = await pdfService.uploadAgreementToStorage(
        finalPdfBlob,
        agreement!.agreement_number,
        user!.id
      );

      // Verify OTP and Save to DB
      await agreementService.verifyOTPAndSign(
        user!.email,
        otp,
        agreement!.id,
        user!.id,
        deviceInfo,
        pdfUrl,
        hashId
      );

      setStep('success');
      if (onSuccess) setTimeout(onSuccess, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to verify OTP or generate agreement.');
      setStep('otp_verify');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 'preview') {
    return (
      <div className="flex justify-center items-center h-64 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl max-w-4xl mx-auto">
      <div className="bg-black p-6 border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-yellow-500" />
          <div>
            <h2 className="text-xl font-bold text-white">Electronic Legal Agreement</h2>
            <p className="text-zinc-400 text-sm">BharatFilmIndustry™ Secure E-Signature</p>
          </div>
        </div>
        {agreement?.agreement_number && (
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase">Agreement No.</div>
            <div className="text-sm font-mono text-zinc-300">{agreement.agreement_number}</div>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center space-x-3 text-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {step === 'preview' && agreement && (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 h-96 overflow-y-auto font-serif text-zinc-300 text-sm leading-relaxed">
              <h3 className="text-lg font-bold text-white text-center mb-6 uppercase">
                {agreement.type === 'investor' ? 'INVESTOR AGREEMENT' : 'FILMMAKER AGREEMENT'}
              </h3>
              <p>This Electronic Agreement is entered into by and between BharatFilmIndustry™ and {user?.name}.</p>
              <br/>
              <p><strong>Project:</strong> {project?.title || 'TBD'}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              <br/>
              <p>By signing this agreement, the User acknowledges and agrees to the following terms and conditions:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Compliance with all applicable laws including Information Technology Act, 2000.</li>
                <li>Digital signatures executed via OTP verification are legally binding.</li>
                <li>All investments carry risk; no financial returns are guaranteed by the Company.</li>
                <li>Data processing consent is granted as per the Privacy Policy.</li>
                <li>Any disputes shall be resolved in the designated jurisdiction.</li>
              </ul>
              <br/>
              <p className="italic text-center text-zinc-500 mt-10">-- End of Agreement Preview --</p>
            </div>

            <div className="bg-black/50 p-4 rounded-lg border border-yellow-900/30">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-zinc-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900 bg-zinc-800"
                />
                <span className="text-sm text-zinc-300">
                  I have read and understood the terms of this agreement. I consent to electronically sign this document and understand it constitutes a legally binding contract.
                </span>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              {onCancel && (
                <button 
                  onClick={onCancel}
                  className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleRequestOTP}
                disabled={!agreed || loading}
                className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Smartphone className="h-4 w-4" />
                <span>Send OTP to Sign</span>
              </button>
            </div>
          </div>
        )}

        {step === 'otp_verify' && (
          <div className="max-w-md mx-auto py-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Verify & Sign</h3>
              <p className="text-zinc-400 text-sm">
                Enter the 6-digit verification code sent to <br/>
                <strong className="text-white">{user?.email}</strong>
              </p>
            </div>
            
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-zinc-950 border border-zinc-700 rounded-lg py-4 text-white focus:outline-none focus:border-yellow-500"
            />

            <button 
              onClick={handleVerifyAndSign}
              disabled={otp.length < 6 || loading}
              className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying & Signing...' : 'Digitally Sign Agreement'}
            </button>
            
            <button 
              onClick={() => setStep('preview')}
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              Back to Agreement
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-20 text-center space-y-6">
            <div className="animate-spin mx-auto rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Generating Secure PDF</h3>
              <p className="text-zinc-400 text-sm">Applying digital hash, QR code, and finalizing audit trail...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-16 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Agreement Signed Successfully</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                Your legally binding agreement has been generated and securely stored. 
              </p>
            </div>
            
            <div className="pt-4 flex justify-center space-x-4">
              <button 
                onClick={() => {
                  if (onSuccess) onSuccess();
                }}
                className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
