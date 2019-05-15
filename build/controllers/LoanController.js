"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _loanHelper = _interopRequireDefault(require("../helpers/loanHelper"));

var _LoanDB = _interopRequireDefault(require("../models/LoanDB"));

var _LoanRepaymentDB = _interopRequireDefault(require("../models/LoanRepaymentDB"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var loanController = {
  applyLoan: function applyLoan(req, res) {
    var _validate$validateLoa = _loanHelper["default"].validateLoan(req.body),
        error = _validate$validateLoa.error;

    var arrErrors = [];

    var allValdatorFunct = function allValdatorFunct() {
      for (var i = 0; i < error.details.length; i++) {
        arrErrors.push(error.details[i].message);
      }
    };

    if (error) {
      // eslint-disable-next-line no-unused-expressions
      "".concat(allValdatorFunct());
      if (error) return res.status(400).json({
        status: 400,
        errors: arrErrors
      });
    } else {
      var theTenor = parseInt(req.body.tenor);
      var theAmount = parseFloat(req.body.amount);
      var theInterest = parseFloat(req.body.amount) * 0.05;
      var thepaymentInstallment = parseFloat((theAmount + theInterest) / theTenor).toFixed(2);
      var theBalance = parseFloat(theAmount + theInterest).toFixed(2);

      var haveApplyLoan = _LoanDB["default"].loans.find(function (findEmail) {
        return findEmail.email === req.user.email;
      });

      if (req.user.status === 'verified') {
        if (!haveApplyLoan || haveApplyLoan.repaid === 'true') {
          var loan = {
            loanId: _LoanDB["default"].loans.length + 1,
            email: req.user.email,
            CreatedOn: new Date(),
            status: 'pending',
            repaid: 'false',
            tenor: theTenor,
            amount: theAmount,
            paymentInstallment: thepaymentInstallment,
            balance: theBalance,
            interest: theInterest
          };

          _LoanDB["default"].loans.push(loan);

          return res.status(201).json({
            status: 201,
            message: 'Loan Applied Successfully, Good Luck!',
            data: {
              loanId: loan.loanId,
              CreatedOn: new Date(),
              firstName: req.user.firstName,
              lastName: req.user.lastName,
              email: req.user.email,
              tenor: loan.tenor,
              amount: loan.amount,
              paymentInstallment: loan.paymentInstallment,
              status: 'pending',
              balance: loan.balance,
              interest: loan.interest.toFixed(2)
            }
          });
        }

        return res.status(400).json({
          status: 400,
          message: "Ooops!! You have unpaid Loan of ## ".concat(haveApplyLoan.balance, " ##, Please repay this loan!")
        });
      }

      return res.status(400).json({
        status: 400,
        message: 'Sorry! Your are not yet verified, Please contact Admin !'
      });
    }
  },
  allLoans: function allLoans(req, res) {
    if (req.user.isAdmin === 'true') {
      var statusLoansQuery = req.query.status;
      var repaidLoansQuery = req.query.repaid;

      var loansFilteringQuery = _LoanDB["default"].loans.filter(function (result) {
        return result.status === statusLoansQuery && result.repaid === repaidLoansQuery;
      });

      if (loansFilteringQuery.length !== 0) {
        res.status(200).send({
          status: 200,
          data: loansFilteringQuery
        });
      } else if (statusLoansQuery == null && repaidLoansQuery == null && _LoanDB["default"].loans.length !== 0) {
        res.status(200).send({
          status: 200,
          data: _LoanDB["default"].loans
        });
      } else {
        res.status(404).json({
          status: 404,
          message: 'No Loan Found!'
        });
      }
    } else {
      res.status(400).json({
        status: 400,
        message: 'Sorry! You dont have a right to view loan Application history. Any question contact Admin!'
      });
    }
  },
  specificLoan: function specificLoan(req, res) {
    if (req.user.isAdmin === 'true') {
      var theId = parseInt(req.params.id);

      var loan = _LoanDB["default"].loans.find(function (findLoan) {
        return findLoan.loanId === theId;
      });

      if (!loan) return res.status(404).json({
        status: 404,
        error: "Loan with ID ## ".concat(theId, " ## not found!")
      });
      return res.status(200).json({
        status: 200,
        data: {
          id: loan.loanId,
          user: loan.email,
          CreatedOn: loan.CreatedOn,
          status: loan.status,
          repaid: loan.repaid,
          tenor: loan.tenor,
          amount: loan.amount,
          paymentInstallment: loan.paymentInstallment,
          balance: loan.balance,
          interest: loan.interest
        }
      });
    }

    return res.status(400).json({
      status: 400,
      message: 'Oops! You dont have a right to view specific loan Application history!'
    });
  },
  approveLoan: function approveLoan(req, res) {
    if (req.user.isAdmin === 'true') {
      var _validate$validateApp = _loanHelper["default"].validateApproveLoan(req.body),
          error = _validate$validateApp.error;

      var arrErrors = [];

      var allValdatorFunct = function allValdatorFunct() {
        for (var i = 0; i < error.details.length; i++) {
          arrErrors.push(error.details[i].message);
        }
      };

      if (error) {
        // eslint-disable-next-line no-unused-expressions
        "".concat(allValdatorFunct());
        if (error) return res.status(400).json({
          status: 400,
          errors: arrErrors
        });
      } else {
        var loan = _LoanDB["default"].loans.find(function (findLoan) {
          return findLoan.loanId === parseInt(req.params.id);
        });

        if (!loan) return res.status(404).json({
          status: 404,
          error: "Loan with ID ## ".concat(req.params.id, " ## not found!")
        });
        if (loan.status === 'approved') return res.status(400).json({
          status: 400,
          message: 'Loan Application Already Up-to-date(Approved)!'
        });
        loan.status = req.body.status;
        return res.status(200).json({
          status: 200,
          data: {
            loanId: loan.loanId,
            loanAmount: loan.amount,
            tenor: loan.tenor,
            status: loan.status,
            monthlyInstallment: loan.paymentInstallment,
            interest: loan.interest
          }
        });
      }

      return res.status(400).json({
        status: 400,
        message: 'Oops! You dont have a right to Approve/Reject loan Application!'
      });
    }
  },
  // loan Repayment
  repayLoan: function repayLoan(req, res) {
    if (req.user.isAdmin === 'true') {
      var _validate$validateRep = _loanHelper["default"].validateRepayment(req.body),
          error = _validate$validateRep.error;

      if (error) return res.status(400).json({
        status: 400,
        error: error.details[0].message
      });

      var loan = _LoanDB["default"].loans.find(function (findLoan) {
        return findLoan.loanId === parseInt(req.params.id);
      });

      if (!loan) return res.status(404).json({
        status: 404,
        error: "Loan with ID ## ".concat(req.params.id, " ## not found!")
      });
      var theAmount = parseFloat(req.body.amount);
      var theDiffrence = theAmount - loan.balance;

      var weOfferYou = function weOfferYou() {
        return theDiffrence;
      };

      var repayment = {
        id: _LoanRepaymentDB["default"].repayments.length + 1,
        CreatedOn: new Date(),
        loanId: loan.loanId,
        amount: theAmount,
        OfferAmount: loan.balance - theAmount
      }; //check loan status if is approved

      if (loan.status === 'pending' || loan.status === 'rejected') {
        return res.status(400).json({
          status: 400,
          message: "Oops Nothing to repay! Your Loan Application on [ ".concat(loan.CreatedOn, " ] for [ ").concat(loan.amount, " ] still Pending or rejected!")
        });
      }

      if (loan.balance === 0) {
        return res.status(400).json({
          status: 400,
          message: "Oops Nothing to repay, You have paid your loan!"
        });
      } else {
        if (repayment.amount >= loan.balance) {
          loan.balance = 0;
          loan.repaid = "true";

          _LoanRepaymentDB["default"].repayments.push(repayment);

          return res.status(201).json({
            status: 201,
            message: "Repayment Created Successfully and You repay over-Amount! We of offer you [ ".concat(weOfferYou(), " ]"),
            data: {
              id: repayment.id,
              loanId: loan.loanId,
              CreatedOn: new Date(),
              amount: loan.amount,
              monthlyInstallment: loan.paymentInstallment,
              paidAmount: repayment.amount,
              balance: loan.balance
            }
          });
        } else {
          loan.balance = loan.balance - theAmount;

          _LoanRepaymentDB["default"].repayments.push(repayment);

          return res.status(201).json({
            status: 201,
            message: 'Repayment Created Successfully!',
            data: {
              id: repayment.id,
              loanId: loan.loanId,
              CreatedOn: new Date(),
              amount: loan.amount,
              monthlyInstallment: loan.paymentInstallment,
              paidAmount: repayment.amount,
              balance: loan.balance
            }
          });
        }
      }
    } else {
      return res.status(400).json({
        status: 400,
        message: 'Oops! You dont have a right to repay a loan, call Admin!'
      });
    }
  },
  allRepaymentLoan: function allRepaymentLoan(req, res) {
    if (!_LoanRepaymentDB["default"].repayments.length) return res.status(404).json({
      status: 404,
      message: 'No Repayment Created Yet!'
    });
    return res.status(200).json({
      status: 200,
      data: _LoanRepaymentDB["default"].repayments
    });
  }
};
var _default = loanController;
exports["default"] = _default;