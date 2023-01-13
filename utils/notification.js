import { toast } from 'react-toastify';

export function notify(id, msg) {
    toast(msg, {
        autoClose: false,
        toastId: id,
        type: toast.TYPE.INFO,
    });
}

export function update(id, msg) {
    toast.update(id, {
        autoClose: 5000,
        render: msg,
        type: toast.TYPE.SUCCESS,
    });
}