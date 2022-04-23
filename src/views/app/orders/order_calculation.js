import React from "react";

function OrderCalculation(props) {
  const {
    actual_price,
    discount,
    travel_charges,
    waiting_charges,
    net_total,
    deal_discount,
    coupon_discount,
    free_service_redeemed_discount,
  } = props.calculation;
  let order_calculation_html = (
    <>
      <div className="card summary">
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="bg-light">
              <tr>
                <td>
                  <h3 className="mb-0"> Calculation </h3>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Services Price</td>
                <td>
                  <span className="float-right"> {actual_price}</span>
                </td>
              </tr>
              <tr>
                <td>Discounts</td>
                <td>
                  <span className="float-right"> {discount} </span>
                </td>
              </tr>
              <tr>
                <td>Travel Charges</td>
                <td>
                  <span className="float-right">{travel_charges}</span>
                </td>
              </tr>
              <tr>
                <td>Waiting Charges</td>
                <td>
                  <span className="float-right">{waiting_charges}</span>
                </td>
              </tr>
              <tr>
                <td>Deal Discounts</td>
                <td>
                  <span className="float-right">{deal_discount}</span>
                </td>
              </tr>
              {coupon_discount === 0 || coupon_discount > 0 ? (
                <>
                  <tr>
                    <td>Coupon Discounts</td>
                    <td>
                      <span className="float-right">{coupon_discount}</span>
                    </td>
                  </tr>
                </>
              ) : (
                <></>
              )}
              {free_service_redeemed_discount > 0 ? (
                <>
                  <tr>
                    <td>Free Service Discount</td>
                    <td>
                      <span className="float-right">
                        {free_service_redeemed_discount}
                      </span>
                    </td>
                  </tr>
                </>
              ) : (
                <></>
              )}
            </tbody>
            <tfoot className="bg-dark text-light">
              <tr>
                <td>Totals</td>
                <td>
                  <span className="float-right">{net_total}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );

  return order_calculation_html;
}

export default OrderCalculation;
