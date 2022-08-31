import { Db, MongoClient, ObjectId } from 'mongodb';
import { Dir } from '../types';

export default class {
    private db: Promise<Db>;
    private files: Record<string, Dir> = {};
    constructor(private config: DatabaseConfig) {
        const client = new MongoClient(config.uri);
        this.db = client.connect().then(() => client.db(config.name));
    }

    async getFiles(branch: string) {
        if (this.files[branch]) return this.files[branch];
        const collection = (await this.db).collection<Dir>(branch);
        const found = await collection.findOne();
        if (found) return this.files[branch] = found;
        const obj = <Dir><unknown>{
            name: this.config.rootName,
            files: [],
            folders: [],
        };
        collection.insertOne(obj);
        return this.files[branch] = obj;
    }

    async setFiles(branch: string, data: Dir & { _id?: ObjectId; }) {
        await this.getFiles(branch);
        delete data._id;
        this.files[branch] = JSON.parse(JSON.stringify(data));
        (await this.db).collection(branch).updateOne({}, { $set: data });
    }
}

export type DatabaseConfig = Record<'uri' | 'name' | 'rootName', string>;