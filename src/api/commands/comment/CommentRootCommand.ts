import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotImplementedException } from '../../exceptions/NotImplementedException';

export class CommentRootCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.COMMENT_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (post|search)';
    }

    public description(): string {
        return 'Commands for managing comments.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
