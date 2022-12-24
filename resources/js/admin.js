import axios from 'axios'
// to show placed at time at admin order section
import moment from 'moment'
import Noty from 'noty'

export function initAdmin(socket) {
    // fetch admin order section table's tbody
    // to feed orders using web sockets(in real time)
    const orderTableBody = document.querySelector('#orderTableBody')
    let orders = [] // to store all orders
    let markup // to generate html code for all orders in admin order section

    // get request at /admin/orders
    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then((res) => {
        // will get all orders from admin's orderController in res.data
        orders = res.data
        // generate markup and fedd in table's tbody
        markup = generateMarkup(orders)
        orderTableBody.innerHTML = markup
    }).catch((err) => {
        console.log(err)
    })

    // this function will generate all pizza items in a order and return to div of generate markup function below which will then list all pizza items in one order at admin order section(in one row) in table
    function renderItems(items) {
        // items is object containing pizza objects
        // so Object.values(items) will give array of pizza objects in one order
        let parsedItems = Object.values(items)
        // this will return array of html markup for all pizza name and qty in single order
        return parsedItems.map((menuItem) => {
            return `
                <p>${ menuItem.item.name } - ${ menuItem.qty } pcs </p>
            `
        }).join('')
        // .join() method will combine this array of markup with no delimeter
        // so this fn will finally generate array of paragraphs with pizza name and qty in one order
      }

    function generateMarkup(orders) {
        // orders is array of orders
        // map function on array
        // map function applies a function on each elt of array and returns modified array
        // refer this guide: https://www.w3schools.com/jsref/jsref_map.asp

        // so this will return array of markup inside map function
        
        return orders.map((order) => {
            return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${ order._id }</p>
                    <div>${ renderItems(order.items) }</div>
                </td>
                <td class="border px-4 py-2">${ order.customerId.name }</td>
                <td class="border px-4 py-2">${ order.address }</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${ order.status === 'order_placed' ? 'selected' : '' }>
                                    Placed</option>
                                <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                    Confirmed</option>
                                <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                    Prepared</option>
                                <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                    Delivered
                                </option>
                                <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('hh:mm A') }
                </td>
                <td class="border px-4 py-2">
                    ${ order.paymentStatus ? 'Paid' : 'Not paid' }
                </td>
            </tr>
        `
        }).join('')
        // .join() method will combine this array of markup with no delimeter
        // so this function will returns rows of all orders at admin order section
    }

    // Socket
    socket.on('orderPlaced', (order) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'New order!',
            progressBar: false,
        }).show();
        orders.unshift(order)
        orderTableBody.innerHTML = ''
        orderTableBody.innerHTML = generateMarkup(orders)
    })
}