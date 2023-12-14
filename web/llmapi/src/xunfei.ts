import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import crypto from 'crypto';

type AuthConfig = {
    appId: string;
    apiKey: string;
    apiSecret: string;
}

type ChatMessage = {
    text: string;
    role: string;
    status: string;
}

type ChatSession = {
    chatHistory: ChatMessage[];
    status: string;
}

class Xunfei {
    private appId: string;
    private apiKey: string;
    private apiSecret: string;
    private xfHost = "spark-api.xf-yun.com";
    private path = "/v2.1/chat";
    private domain = "generalv2";

    constructor(authConfig: AuthConfig) {
        this.appId = authConfig.appId;
        this.apiKey = authConfig.apiKey;
        this.apiSecret = authConfig.apiSecret;
    }

    private generateAuthorization(): string {
        const date = new Date().toUTCString();
        const requestLine = `GET ${this.path} HTTP/1.1`;
        const header = `host: ${this.xfHost}\ndate: ${date}\n${requestLine}`;

        const hmac = crypto.createHmac('sha256', this.apiSecret);
        hmac.update(header);
        const signature = hmac.digest('base64');

        const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;

        return Buffer.from(authorizationOrigin).toString('base64');
    }

    private getWebSocketSession(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`wss://${this.xfHost}${this.path}`, {
                headers: {
                    authorization: this.generateAuthorization(),
                    date: new Date().toUTCString(),
                    host: this.xfHost
                }
            });

            ws.on('open', () => {
                resolve(ws);
            });

            ws.on('error', (err) => {
                reject(err);
            });
        });
    }

    async textComplete(session: ChatSession) {
        const ws = await this.getWebSocketSession();

        const uid = uuidv4().substring(0, 32);
        const message = {
            header: {
                app_id: this.appId,
                uid: uid
            },
            parameter: {
                chat: {
                    domain: this.domain,
                    temperature: 0.5,
                    max_tokens: 1024
                }
            },
            payload: {
                message: {
                    text: session.chatHistory.map(msg => ({
                        role: msg.role.toLowerCase(),
                        content: msg.text
                    }))
                }
            }
        };

        ws.send(JSON.stringify(message));

        ws.on('message', (data) => {
            // handle incoming message
            console.log(data);
        });
    }
}

export default Xunfei
