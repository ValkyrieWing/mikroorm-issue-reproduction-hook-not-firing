import {
  BeforeUpdate,
  Entity,
  MikroORM,
  PrimaryKey,
  Property,
} from "@mikro-orm/sqlite";

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @Property({ unique: true })
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  @BeforeUpdate()
  validation() {
    this.name = "beforeupdate fired";
  }
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ":memory:",
    entities: [User],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("after persist", async () => {
  const em = orm.em.fork();
  const userEntity = new User("name", "email");
  em.persist(userEntity);
  expect(userEntity.name).toBe("beforeupdate fired");
  await em.flush();
});

test("after flush", async () => {
  const em = orm.em.fork();
  const userEntity = new User("name", "email");
  em.persist(userEntity);
  await em.flush();
  expect(userEntity.name).toBe("beforeupdate fired");
});
