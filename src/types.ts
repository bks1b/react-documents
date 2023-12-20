export type BaseFile = {
    name: string;
    public: boolean;
    path: string[];
};

export type Dir = BaseFile & {
    type: 'dir';
    open: boolean;
    files: Doc[];
    folders: Dir[];
};

export type Doc = BaseFile & { type: 'doc'; text: string; };