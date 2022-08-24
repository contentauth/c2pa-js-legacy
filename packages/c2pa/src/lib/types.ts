/**
 * Copyright 2022 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

type DisposeFn = () => void;
export type Disposable<Data extends { [key: string]: any} = {}> = Data & { dispose: DisposeFn } 


