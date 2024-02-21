import { By } from "selenium-webdriver";
import { driver } from "./driver";
import { prisma } from "./prisma";
import _, { isEqual } from 'lodash';
import { format, isAfter, isBefore } from "date-fns";


const main = async () => {
  const purchases = await prisma.fiisPurchases.findMany();
  const fiis = Object.keys(_.groupBy(purchases, 'fiiName'));
  const urls = fiis.filter(f => !f.includes("13")).map((name) => "https://fiis.com.br/" + name + "/");
  const history = await prisma.payment.findMany();

  const payments = []

  for (const url of urls) {
    await driver.get(url);

    const body = await driver.findElement(By.xpath('//*[@id="carbon_fields_fiis_dividends-2"]/div[2]/div[2]/div/div/div/div/div[2]/div[1]'));
    const rowAsString = await body.getAttribute("innerHTML")
    const strings = rowAsString?.split("\n").filter((s) => s?.length > 0 && s !== '<div class="table__linha">')
    const formattedStrings = strings?.map((str) => str.replace(" </div>", ""))
    const lastPaymentDate = formattedStrings?.[1]
    const quotationAtPayment = formattedStrings?.[2]
    const monthlyYield = formattedStrings?.[3]
    const paid = formattedStrings?.[4]

    const quotationContainer = await driver.findElement(By.className("item quotation"));
    const quotationValue = await quotationContainer.findElement(By.className("value")).then((el) => el.getText());

    const fiiName = url.split("/")[3];
    const fiisPurchases = purchases.filter((purchase) => purchase.fiiName === fiiName);

    const onlyPurchasesBeforeCurrentPayment = fiisPurchases.filter(purchase => {
      const dbDateSplited = purchase.purchaseDate.split(/\//)
      const dbDateFormated = [dbDateSplited[1], dbDateSplited[0], dbDateSplited[2]].join('/')
      const paymentSplit = lastPaymentDate.replaceAll(".", "/").split(/\//)
      const paymentFormated = [paymentSplit[1], paymentSplit[0], paymentSplit[2]].join('/')
      return isBefore(new Date(dbDateFormated), new Date(paymentFormated)) || isEqual(new Date(dbDateFormated), new Date(paymentFormated))
    })

    if (onlyPurchasesBeforeCurrentPayment.length === 0) return;
    const quotesQuantityAtThePayment = fiisPurchases?.reduce((acc, purchase) => acc + purchase.qty, 0);

    payments.push({
      fiiName: url.split("/")[3],
      url,
      lastPaymentDate: lastPaymentDate.replaceAll(".", "/"),
      quotationAtPayment,
      monthlyYield,
      paid,
      atualQuotation: quotationValue,
      quotesQuantityAtThePayment
    });
  }

  for (const payment of payments) {
    const alreadyInsertedPayment = history.find((history) =>
      history.date === payment.lastPaymentDate && history.fiiName === payment.fiiName
    )

    if (alreadyInsertedPayment) {
      console.log("Pagamento já cadastrado, foi atualizado a cotação");
      await prisma.fiisPurchases.updateMany({
        where: { fiiName: payment.fiiName }, data: {
          quotationValue: parseFloat(payment.atualQuotation.replace(",", "."))
        }
      })
      continue;
    }



    const res = await prisma.payment.create({
      data: {
        date: payment.lastPaymentDate,
        fiiName: payment.fiiName,
        monthlyYield: parseFloat(payment.monthlyYield.replace("%", "").replace(",", ".")),
        paidPerQuote: parseFloat(payment.paid.replace(",", ".").replace("R$ ", "")),
        quotationAtPayment: parseFloat(payment.quotationAtPayment.replace(",", ".").replace("R$ ", "")),
        quotesQuantityAtThePayment: payment?.quotesQuantityAtThePayment
      }
    })
    console.log("Pagamento cadastrado", res);
  }
};


main();
