import { Reducer } from 'redux';

export type SnackbarType = 'error' | 'warning' | 'info' | 'success';

export interface SnackbarState {
  isOpen: boolean;
  text: string;
  type: SnackbarType
}

const defaultState: SnackbarState = {
  isOpen: false,
  text: '',
  type: 'info'
};

interface SnackbarOpened {
  type: 'SNACKBAR_OPENED',
  text: string,
  snackbarType: SnackbarType
}

interface SnackbarClosed {
  type: 'SNACKBAR_CLOSED'
}

export const actions = {
  showSnackbar: (text: string, type: SnackbarType): SnackbarOpened => {
    return {
      type: 'SNACKBAR_OPENED',
      text, snackbarType: type
    };
  },

  closeSnackbar: (): SnackbarClosed => {
    return {
      type: 'SNACKBAR_CLOSED'
    };
  }
}

type KnownAction = SnackbarOpened | SnackbarClosed;

export const reducer: Reducer<SnackbarState> = (state: SnackbarState | undefined, action: KnownAction) => {
  if (!state) {
    return defaultState;
  }

  switch (action.type) {
    case 'SNACKBAR_OPENED':
      return {
        isOpen: true,
        text: action.text,
        type: action.snackbarType
      };
    case 'SNACKBAR_CLOSED':
      return {
        ...state,
        isOpen: false
      };
  }

  return state;
}