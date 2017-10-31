import { inject, named } from 'inversify';
import { controller, httpPost, response, requestBody } from 'inversify-express-utils';
import { app } from '../../app';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { JsonRpc2Request, RpcErrorCode } from '../../core/api/jsonrpc';
import { JsonRpcError } from '../../core/api/JsonRpcError';
import {ItemCategoryService} from '../services/ItemCategoryService';

// Get middlewares
const rpc = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RpcMiddleware);
let rpcIdCount = 0;

@controller('/rpc', rpc.use)
export class RpcController {

    public log: LoggerType;
    private VERSION = '2.0';
    private MAX_INT32 = 2147483647;
    private exposedMethods = {};

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        // @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        // @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        // @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        // @inject(Types.Service) @named(Targets.Service.ImageDataService) private imageDataService: ImageDataService,
        // @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);

        // expose/"route" the rpc methods here
        // injectedInstanceName.function
        this.exposedMethods = {
            // todo: figure out a working way to pass for example: this.escrowService.create
            //
            'itemcategory.create': 'itemCategoryService.rpcCreate',
            'itemcategory.find': 'itemCategoryService.rpcFindOne',
            'itemcategory.findall': 'itemCategoryService.rpcFindAll',
            'itemcategory.findroot': 'itemCategoryService.rpcFindRoot',
            'itemcategory.update': 'itemCategoryService.rpcUpdate',
            'itemcategory.destroy': 'itemCategoryService.rpcDestroy',

            'escrow.create': 'escrowService.rpcCreate',
            'escrow.find': 'escrowService.rpcFindOne',
            'escrow.findall': 'escrowService.rpcFindAll',
            'escrow.update': 'escrowService.rpcUpdate',
            'itemprice.create': 'itemPriceService.rpcCreate',
            'itemprice.find': 'itemPriceService.rpcFindOne',
            'itemprice.findall': 'itemPriceService.rpcFindAll',
            'itemprice.update': 'itemPriceService.rpcUpdate',
            'paymentinformation.create': 'paymentInformationService.rpcCreate',
            'paymentinformation.find': 'paymentInformationService.rpcFindOne',
            'paymentinformation.findall': 'paymentInformationService.rpcFindAll',
            'paymentinformation.update': 'paymentInformationService.rpcUpdate',
            'imagedata.create': 'imageDataService.rpcCreate',
            'imagedata.find': 'imageDataService.rpcFindOne',
            'imagedata.findall': 'imageDataService.rpcFindAll',
            'imagedata.update': 'imageDataService.rpcUpdate',
            'itemimage.create': 'itemImageService.rpcCreate',
            'itemimage.find': 'itemImageService.rpcFindOne',
            'itemimage.findall': 'itemImageService.rpcFindAll',
            'itemimage.update': 'itemImageService.rpcUpdate'
        };
    }

    @httpPost('/')
    public async handleRPC(@response() res: myExpress.Response, @requestBody() body: any): Promise<any> {

        const rpcRequest = this.createRequest(body.method, body.params);
        this.log.debug('controller.handleRPC() rpcRequest:', JSON.stringify(rpcRequest, null, 2));

        // check that we have exposed the method
        if (this.exposedMethods.hasOwnProperty(body.method)) {

            const callPath = this.exposedMethods[rpcRequest.method].split('.');

            // make sure we have an instance of the service and it contains the function we want to call
            if (this.hasOwnProperty(callPath[0]) && typeof this[callPath[0]][callPath[1]] === 'function') {

                this.log.debug('controller.handleRPC(), CALL: ' + rpcRequest.method + ' -> ' + this.exposedMethods[rpcRequest.method]);
                return this[callPath[0]][callPath[1]](rpcRequest);
            } else {
                return res.failed(400, this.getErrorMessage(RpcErrorCode.InternalError), new JsonRpcError(RpcErrorCode.InternalError,
                    'method: ' + body.method + ' routing failed.'));
            }
        } else {
            // no body.method found -> invalid call
            return res.failed(400, this.getErrorMessage(RpcErrorCode.MethodNotFound), new JsonRpcError(RpcErrorCode.MethodNotFound,
                'method: ' + body.method + ' not found.'));
        }

    }

    private createRequest(method: string, params?: any, id?: string | number): JsonRpc2Request {
        if (id === null || id === undefined) {
            id = this.generateId();
        } else if (typeof (id) !== 'number') {
            id = String(id);
        }
        return { jsonrpc: this.VERSION, method: method.toLowerCase(), params, id };
    }

    private generateId(): number {
        if (rpcIdCount >= this.MAX_INT32) {
            rpcIdCount = 0;
        }
        return ++rpcIdCount;
    }

    private getErrorMessage(code: number): string {
        switch (code) {
            case RpcErrorCode.ParseError:
                return 'Parse error';
            case RpcErrorCode.InvalidRequest:
                return 'Invalid Request';
            case RpcErrorCode.MethodNotFound:
                return 'Method not found';
            case RpcErrorCode.InvalidParams:
                return 'Invalid params';
            case RpcErrorCode.InternalError:
                return 'Internal error';
        }
        return 'Unknown Error';
    }
}