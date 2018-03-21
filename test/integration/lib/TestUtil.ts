
import { Logger as LoggerType} from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { EventEmitter } from '../../../src/core/api/events';
import { ServerStartedListener } from '../../../src/api/listeners/ServerStartedListener';

export class TestUtil {

    public log: LoggerType;
    private serverStartedListener: ServerStartedListener;

    constructor() {
        this.log = new LoggerType(__filename);
    }

    public async bootstrapAppContainer(app: any): boolean {

        // const emitter =
        await app.bootstrap();
        this.serverStartedListener = app.IoC.getNamed<ServerStartedListener>(Types.Listener, Targets.Listener.ServerStartedListener);

        // emitter.on(ServerStartedListener.ServerReadyEvent, () => {
        //    this.serverStarted = true;
        // });
        await this.waitForServerStarted();

    }

    private async isServerStarted(): boolean {
        if (this.serverStartedListener.isAppReady === false) {
            throw Error('Not started.');
        } else {
            this.log.debug('SERVER READY!');
        }
        return true;
    }

    private waitFor(timeout: number): Promise<void> {
        this.log.debug('waiting for ' + timeout + 'ms');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }

    private async waitForServerStarted(): boolean {

        const MAX_RETRIES = 20;
        for (let i = 0; i <= MAX_RETRIES; i++) {
            try {
                return await this.isServerStarted();
            } catch (err) {
                const timeout = 1000;
                await this.waitFor(timeout);
                this.log.debug('error: ' + err.message);
            }
        }
    }
}


