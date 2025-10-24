import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Campana } from '../../types';
import api from '../../services/api';

export interface CampaignState {
    campaigns: Campana[];
    activeCampaign: Campana | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CampaignState = {
    campaigns: [],
    activeCampaign: null,
    isLoading: false,
    error: null
};

export const fetchCampaigns = createAsyncThunk(
    'campaign/fetchAll',
    async () => {
        const response = await api.get('/campanas');
        return response.data;
    }
);

export const getCampaign = createAsyncThunk(
    'campaign/getOne',
    async (id: string) => {
        const response = await api.get(`/campanas/${id}`);
        return response.data;
    }
);

export const vote = createAsyncThunk(
    'campaign/vote',
    async ({ campaignId, candidateId }: { campaignId: string; candidateId: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/campanas/${campaignId}/votar/${candidateId}`);
            return response.data;
        } catch (error: any) {
            console.log('Error completo:', error);
            
            if (error.response?.data) {
                const errorMessage = error.response.data.message || error.response.data.error;
                if (errorMessage) {
                    throw new Error(errorMessage);
                }
            }
            throw new Error('Error al procesar el voto');
        }
    }
);

export const createCampaign = createAsyncThunk(
    'campaign/create',
    async (campaignData: Partial<Campana>) => {
        const response = await api.post('/campanas', campaignData);
        return response.data;
    }
);

export const deleteCampaign = createAsyncThunk(
    'campaign/delete',
    async (id: string) => {
        await api.delete(`/campanas/${id}`);
        return id;
    }
);

export const updateCampaign = createAsyncThunk(
    'campaign/update',
    async ({ id, ...campaignData }: Partial<Campana> & { id: string }) => {
        try {
            console.log('Enviando actualización para la campaña:', id);
            const response = await api.put(`/campanas/${id}`, campaignData);
            console.log('Respuesta del servidor:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error al actualizar la campaña:', error.response?.data || error.message);
            throw error;
        }
    }
);

export const toggleCampaignStatus = createAsyncThunk(
    'campaign/toggleStatus',
    async ({ id, estado }: { id: string; estado: 'habilitada' | 'deshabilitada' }) => {
        const response = await api.patch(`/campanas/${id}/estado`, { estado });
        return response.data;
    }
);

const campaignSlice = createSlice({
    name: 'campaign',
    initialState,
    reducers: {
        clearCampaignError: (state) => {
            state.error = null;
        },
        clearActiveCampaign: (state) => {
            state.activeCampaign = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCampaigns.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.campaigns = action.payload;
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Error al cargar las campañas';
            })
            .addCase(getCampaign.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCampaign.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeCampaign = action.payload;
            })
            .addCase(getCampaign.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Error al cargar la campaña';
            })
            .addCase(vote.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(vote.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.activeCampaign) {
                    state.activeCampaign = action.payload;
                }
            })
            .addCase(vote.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Error al emitir el voto';
            });
    }
});

export const { clearCampaignError, clearActiveCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;