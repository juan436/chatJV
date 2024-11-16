import { useSnackbar } from "notistack";

export const useSnackMessages = ( ) => {
    const { enqueueSnackbar } = useSnackbar();   
    const msgMostrar = ( msg, v ) => {
        enqueueSnackbar(msg, { variant: v })
    }
    return { msgMostrar };
}