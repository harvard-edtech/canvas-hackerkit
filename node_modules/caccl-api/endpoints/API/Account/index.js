/**
 * Functions for interacting with accounts
 * @class api.account
 */

const EndpointCategory = require('../../../classes/EndpointCategory');
const prefix = require('../../common/prefix');

class Account extends EndpointCategory {
  constructor(config) {
    super(config, Account);
  }
}

/*------------------------------------------------------------------------*/
/*                             Subcategories:                             */
/*------------------------------------------------------------------------*/

/*------------------------------------------------------------------------*/
/*                               Endpoints:                               */
/*------------------------------------------------------------------------*/

/**
 * Gets info on a specific course
 * @author Gabriel Abrams
 * @method get
 * @memberof api.account
 * @instance
 * @param {object} options - object containing all arguments
 * @param {number} options.accountId - Canvas acount Id to get info on
 * @return {Promise.<Object>} Canvas account {@link https://canvas.instructure.com/doc/api/accounts.html#Account}
 */
Account.get = function (options) {
  return this.visitEndpoint({
    path: `${prefix.v1}/accounts/${options.accountId}`,
    method: 'GET',
  });
};
Account.get.action = 'get info on a specific account';

/*------------------------------------------------------------------------*/
/*                                 Export                                 */
/*------------------------------------------------------------------------*/

module.exports = Account;
