import { createSlice, createAsyncThunk, SerializedError } from '@reduxjs/toolkit';
import { User } from '../../types';
import api from '../../services/api';

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null
};

export const login = createAsyncThunk(
    'auth/login',
    async ({ numeroColegiado, dpi, fechaNacimiento, password }: any) => {
        const response = await api.post('/users/login', {
            numeroColegiado,
            dpi,
            fechaNacimiento,
            password
        });
        return response.data;
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: Partial<User>, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                return rejectWithValue(error.response.data);
            }
            throw error;
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async () => {
        const response = await api.get('/users/profile');
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log('Login exitoso:', action.payload);
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                console.log('Token guardado:', localStorage.getItem('token'));
            })
            .addCase(login.rejected, (state, { error }: { error: SerializedError }) => {
                state.isLoading = false;
                state.error = error.message || 'Error al iniciar sesión';
            })
            .addCase(loadUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loadUser.rejected, (state, { error }: { error: SerializedError }) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem('token');
                state.error = error.message || 'Error al cargar el usuario';
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(register.rejected, (state, { error }: { error: SerializedError }) => {
                state.isLoading = false;
                state.error = error.message || 'Error en el registro';
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;