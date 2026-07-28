interface StoredInquiry {
  id: number;
  name: string;
  phone: string;
  pet: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

class FakeStatement {
  private values: unknown[] = [];

  constructor(
    private readonly database: FakeD1,
    private readonly query: string,
  ) {}

  bind(...values: unknown[]): this {
    this.values = values;
    return this;
  }

  run(): Promise<{ success: true }> {
    const normalized = this.query.replace(/\s+/g, " ").trim().toLowerCase();

    if (normalized.startsWith("insert or ignore into site_content")) {
      if (!this.database.content) {
        this.database.content = String(this.values[0]);
      }
    } else if (normalized.startsWith("update site_content")) {
      this.database.content = String(this.values[0]);
    } else if (normalized.startsWith("insert into inquiries")) {
      this.database.inquiries.push({
        id: this.database.inquiries.length + 1,
        name: String(this.values[0]),
        phone: String(this.values[1]),
        pet: String(this.values[2]),
        message: String(this.values[3]),
        status: "new",
        created_at: String(this.values[4]),
      });
    } else if (normalized.startsWith("update inquiries set status")) {
      const inquiry = this.database.inquiries.find(
        (item) => item.id === Number(this.values[1]),
      );
      if (inquiry) {
        inquiry.status = this.values[0] as StoredInquiry["status"];
      }
    }

    return Promise.resolve({ success: true });
  }

  first<T>(): Promise<T | null> {
    const normalized = this.query.replace(/\s+/g, " ").trim().toLowerCase();

    if (normalized.includes("select payload from site_content")) {
      return Promise.resolve(
        (this.database.content ? { payload: this.database.content } : null) as T | null,
      );
    }

    if (normalized.includes("from inquiries where id")) {
      return Promise.resolve(
        (this.database.inquiries.find((item) => item.id === Number(this.values[0])) ??
          null) as T | null,
      );
    }

    return Promise.resolve(null);
  }

  all<T>(): Promise<{ results: T[] }> {
    return Promise.resolve({
      results: [...this.database.inquiries].reverse() as T[],
    });
  }
}

export class FakeD1 {
  content = "";
  inquiries: StoredInquiry[] = [];

  prepare(query: string): FakeStatement {
    return new FakeStatement(this, query);
  }

  async batch(statements: FakeStatement[]): Promise<{ success: true }[]> {
    return Promise.all(statements.map((statement) => statement.run()));
  }

  asBinding(): D1Database {
    return this as unknown as D1Database;
  }
}
