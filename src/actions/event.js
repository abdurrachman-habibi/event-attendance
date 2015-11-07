import Firebase from 'firebase';
import {BASE_URL} from './constant';

export const RELOADEVENTS_SUCCESS = 'RELOADEVENTS_SUCCESS';
export const LOADOPENEVENT_SUCCESS = 'LOADOPENEVENT_SUCCESS';
export const UPDATEEVENT_SUCCESS = 'UPDATEEVENT_SUCCESS';
export const RELOADEVENTATTENDANCES_SUCCESS = 'RELOADEVENTATTENDANCES_SUCCESS';

const baseRef = new Firebase(BASE_URL);
const eventsRef = baseRef.child('events');
const eventAdminsRef = baseRef.child('eventAdmins');

function attachCallbackEvents() {
    function loadSuccess(data) {
        return {
            type: RELOADEVENTS_SUCCESS,
            events: data
        };
    }

    return (dispatch) => {
        eventsRef.on('value', (snapshot) => {
            dispatch(loadSuccess(snapshot.val()));
        }, (error) => {
            console.log(error);
        })
    }
}

function detachCallbackEvents() {
    return (dispatch) => {
        eventsRef.off('value');
    }
}

function loadOpenEvents(eventUid) {
    function loadSuccess(data) {
        return {
            type: LOADOPENEVENT_SUCCESS,
            openedEvents: data
        }
    }

    return (dispatch) => {
        if(eventUid){
            eventsRef.child(eventUid).once('value', (snapshot) => {
                dispatch(loadSuccess([snapshot.val()]));
            }, (error) => {
                console.log(error);
            });
        }
        else {
            eventsRef.orderByChild('isClosed').equalTo(false).once('value', (snapshot) => {
                dispatch(loadSuccess(snapshot.val()));
            }, (error) => {
                console.log(error);
            })
        }
    }
}

function update(event, uid) {
    return (dispatch) => {
        if (!uid) {
            let childRef = eventsRef.push();

            registerEventAdmin(childRef.key()).then((auth) => {
                event.admin = {
                    ...auth
                };

                childRef.set(event, (error) => {

                });
            });
        }
        else {
            if (event.isClosed) {
                removeEventAdmin(event.admin);
                event.admin = {};
                eventsRef.child(uid).set(event);
            }
            else {
                registerEventAdmin(uid).then((auth) => {
                    event.admin = {
                        ...auth
                    };
                    eventsRef.child(uid).set(event);
                })
            }
        }
    }
}

function attachEventAttendance(eventUid) {
    function attachSuccess(data) {
        return {
            type: RELOADEVENTATTENDANCES_SUCCESS,
            attendances: data
        }
    }

    return (dispatch) => {
        eventsRef.child(eventUid).child('attendances').on('value', (snapshot) => {
            dispatch(attachSuccess(snapshot.val()));
        })
    }
}

function detachEventAttendance(eventUid) {
    return (dispatch) => {
        eventsRef.child(eventUid).child('attendances').off('value');
    }
}

function updateAttendance(memberUid, eventUid, isAttended) {

    return (dispatch) => {
        let childRef = eventsRef.child(eventUid).child('attendances');
        childRef.child(memberUid).set(isAttended);
    }
}

function registerEventAdmin(eventId) {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    let p = new Promise((resolve, reject) => {
        let email = `${getRandomInt(0, 100000)}@event.com`;
        let password = `${getRandomInt(0, 100000000)}`;

        baseRef.createUser({
            email: email,
            password: password
        }, (error, authData) => {
            let eventAdmin = {};
            eventAdmin[authData.uid] = eventId;
            eventAdminsRef.update(eventAdmin);

            resolve({
                uid: authData.uid,
                email: email,
                password: password
            });
        })
    });

    return p;
}

function removeEventAdmin(admin) {
    let p = new Promise((resolve, reject) => {
        baseRef.removeUser({
            email: admin.email,
            password: admin.password
        }, (error) => {
            eventAdminsRef.child(admin.uid).remove();
            resolve();
        })
    });

    return p;
}

export {attachCallbackEvents, detachCallbackEvents, loadOpenEvents,
    update, updateAttendance, attachEventAttendance, detachEventAttendance}

