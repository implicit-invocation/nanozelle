import { PlaywrightCrawler } from "crawlee";
import { Document } from "langchain/document";
import { BaseDocumentLoader } from "langchain/document_loaders/base";

export class SiteLoader extends BaseDocumentLoader {
  constructor(private startUrls: string[], private glob: string = "*") {
    super();
  }
  async load(): Promise<Document<Record<string, any>>[]> {
    const docs: Document<Record<string, any>>[] = [];
    const crawler = new PlaywrightCrawler({
      requestHandler: async ({ request, page, enqueueLinks, log }) => {
        const title = await page.title();

        console.log(`Fetched page "${title}" from url ${page.url()}`);
        const text = (await page.textContent("body")) as string;

        docs.push(
          new Document({
            metadata: {
              title,
              url: page.url(),
            },
            pageContent: text,
          })
        );

        await enqueueLinks({
          globs: [this.glob],
        });
      },
    });
    await crawler.run(this.startUrls);
    return docs;
  }
}
