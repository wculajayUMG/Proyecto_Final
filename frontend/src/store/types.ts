import { Campana } from '../types';

export interface CampaignState {
    campaigns: Campana[];
    activeCampaign: Campana | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthState {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}