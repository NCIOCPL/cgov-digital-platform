import {
    registerCustomEventListener,
    unregisterCustomEventListener,
    broadcastCustomEvent,
    __attachCustomEventHandler__,
} from '../index';

describe('Module: customEventHandler', () => {

    describe('registerCustomEventListener()', () => {
        it('should throw if [eventType: string] and [listener: function] arguments are passed', () => {
            expect(registerCustomEventListener).toThrow();
            expect(() => { 
                registerCustomEventListener('valid'); 
            }).toThrow();
            expect(() => { 
                registerCustomEventListener('valid', {}); 
            }).toThrow();
            expect(() => { 
                registerCustomEventListener(null, () => {}); 
            }).toThrow();
        })
        it('should return undefined if a listener was successfully subscribed to the customEventHandler', () => {
            expect(registerCustomEventListener('string', () => {})).toBe(undefined);
        })
        it('should register a listener for a custom event', () => {
            __attachCustomEventHandler__();
            const eventType = 'test';
            const listener = jest.fn();
            document.body.innerHTML = '<div id="node"></div>';
            const node = document.getElementById('node');
            registerCustomEventListener(eventType, listener);
            broadcastCustomEvent(eventType, { node });
            // Hacky way to obviate async issue
            setTimeout(() => {
                expect(listener.mock.calls.length).toBe(1);
            }, 0)
        })
    })

    describe('unregisterCustomEventListener()', () => {
        it('should throw if [eventType: string] and [listener: function] arguments are passed', () => {
            expect(unregisterCustomEventListener).toThrow();
            expect(() => { 
                unregisterCustomEventListener('valid'); 
            }).toThrow();
            expect(() => { 
                unregisterCustomEventListener('valid', {}); 
            }).toThrow();
            expect(() => { 
                unregisterCustomEventListener(null, () => {}); 
            }).toThrow();
        })
        it('should throw if an unregistered eventType is specified', () => {
            expect(() => {
                unregisterCustomEventListener('valid', () => {});
            }).toThrow();
        })
        it('should throw if a listener is not already registered for a given eventType', () => {
            const eventType = 'test';
            const listener = () => {};
            registerCustomEventListener(eventType, listener);
            unregisterCustomEventListener(eventType, listener);
            expect(() => {
                unregisterCustomEventListener(eventType, listener);
            }).toThrow();
        })
        it('should return undefined if a listener was successfully unregistered', () => {
            const eventType = 'test';
            const listener = () => {};
            registerCustomEventListener(eventType, listener);
            expect(unregisterCustomEventListener(eventType, listener)).toBe(undefined);
        })
    })
})