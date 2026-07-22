import { supabase } from '../supabase';
import { Agreement, AgreementSignature, User, MovieProject } from '../types';
import crypto from 'crypto-js';

export const agreementService = {
  async getAgreements(userId: string): Promise<Agreement[]> {
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllAgreements(): Promise<Agreement[]> {
    const { data, error } = await supabase
      .from('agreements')
      .select(`
        *,
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async generateAgreementNumber(): Promise<string> {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `BFI-AGR-${new Date().getFullYear()}-${randomNum}`;
  },

  async createAgreement(
    type: 'investor' | 'filmmaker',
    userId: string,
    projectId: string
  ): Promise<Agreement> {
    const agreementNumber = await this.generateAgreementNumber();

    const { data, error } = await supabase
      .from('agreements')
      .insert({
        agreement_number: agreementNumber,
        type,
        user_id: userId,
        project_id: projectId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async sendEmailOTP(email: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    });

    if (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
    return true;
  },

  async verifyOTPAndSign(
    email: string,
    token: string,
    agreementId: string,
    userId: string,
    deviceInfo: any,
    pdfUrl: string,
    hashId: string
  ): Promise<void> {
    // 1. Verify OTP using Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;

    // 2. Insert signature audit trail
    const { error: sigError } = await supabase
      .from('agreement_signatures')
      .insert({
        agreement_id: agreementId,
        user_id: userId,
        ip_address: deviceInfo.ip || 'unknown',
        device_info: deviceInfo.userAgent || 'unknown',
        browser_info: deviceInfo.browser || 'unknown',
        os_info: deviceInfo.os || 'unknown',
        otp_verified_at: new Date().toISOString()
      });

    if (sigError) throw sigError;

    // 3. Update agreement status
    const { error: updateError } = await supabase
      .from('agreements')
      .update({
        status: 'signed',
        pdf_url: pdfUrl,
        hash_id: hashId,
        updated_at: new Date().toISOString()
      })
      .eq('id', agreementId);

    if (updateError) throw updateError;
  },
  
  generateHash(content: string): string {
    return crypto.SHA256(content).toString();
  }
};
