// import cds from '@sap/cds';
//
// export class CatalogService extends cds.ApplicationService {
//     init() {
//
//         this.after('READ', 'Books', results => results.forEach(book => {
//             if (book.stock > 100) book.title += ` -- 10% discount!`
//
//         }))
//
//         this.on('submitOrder', async req => {
//             let { book: id, quantity } = req.data
//             let affected = await UPDATE(Books, id)
//                 .with`stock = stock - ${quantity}`
//                 .where`stock >= ${quantity}`
//
//             if (!affected) req.error`${quantity} exceeds stock for book #${id}`
//         })
//
//         return super.init()
//     }
// }


