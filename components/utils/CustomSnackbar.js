// components/utils/CustomSnackbar.js
import React from 'react';
import { SnackbarContent } from 'notistack';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';

const positioningStyles = {
  entering: 'translateX(0)',
  entered: 'translateX(0)',
  exiting: 'translateX(500px)',
  exited: 'translateX(500px)',
  unmounted: 'translateX(500px)',
};

const CustomSnackbar = React.forwardRef((props, ref) => {
  const { message, variant, onClose, transitionStatus } = props;

  return (
    <SnackbarContent ref={ref} className="custom-snackbar">
      <div
        className="flex items-center gap-4 overflow-hidden bg-white dark:bg-slate-900 rounded-lg border border-solid border-slate-200 dark:border-slate-700 shadow-md text-slate-900 dark:text-slate-50 p-4 text-start"
        style={{
          transform: positioningStyles[transitionStatus],
          transition: 'transform 300ms ease',
        }}
      >
        <CheckRoundedIcon
          sx={{
            color: variant === 'success' ? 'success.main' : 'error.main',
            flexShrink: 0,
            width: '2rem',
            height: '2.5rem',
          }}
        />
        <div className="flex-1 max-w-full">
          <p className="m-0 leading-normal mr-2 font-medium">{message}</p>
        </div>
        <CloseIcon
          onClick={onClose}
          className="cursor-pointer shrink-0 p-0.5 rounded hover:bg-slate-50 hover:dark:bg-slate-800"
        />
      </div>
    </SnackbarContent>
  );
});

// Agregar displayName
CustomSnackbar.displayName = 'CustomSnackbar';

export default CustomSnackbar;