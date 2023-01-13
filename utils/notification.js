import { toast } from 'react-toastify';

export function notify(id, msg) {
    toast(msg, {
        autoClose: false,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: id,
        type: toast.TYPE.INFO,
    });
}

export function update(id, msg) {
    toast.update(id, {
        autoClose: 5000,
        position: toast.POSITION.BOTTOM_RIGHT,
        render: msg,
        toastId: id,
        type: toast.TYPE.SUCCESS,
    });
}