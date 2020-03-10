import { Connection } from '../connection';

export class TestNode {
  constructor(public id: number) {}
}

export class TestConnection extends Connection(TestNode) {}
