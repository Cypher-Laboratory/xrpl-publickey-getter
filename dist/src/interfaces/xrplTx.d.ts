export interface XrplTx {
    Account: string;
    Amount: string;
    Destination: string;
    DestinationTag: number;
    Fee: string;
    Flags: number;
    LastLedgerSequence: number;
    Sequence: number;
    SigningPubKey: string;
    SourceTag: number;
    TransactionType: string;
    TxnSignature: string;
    hash: string;
    inLedger: number;
    ledger_index: number;
}
