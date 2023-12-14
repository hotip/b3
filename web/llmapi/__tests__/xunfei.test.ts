import { describe, test, expect } from 'vitest';
import Xunfei from '../src/xunfei';

describe('xunfeit', () => { 
    test('it works', () => {
        const xunfei = new Xunfei({
            appId: '123',
            apiKey: '456',
            apiSecret: '789'
        });
    })
})