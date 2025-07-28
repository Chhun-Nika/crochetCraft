import { body, validationResult } from 'express-validator';

export const validateCheckout = [
  // Shipping information validation
  body('shippingInfo.first_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  
  body('shippingInfo.last_name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  
  body('shippingInfo.email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address'),
  
  body('shippingInfo.phone')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Please enter a valid phone number'),
  
  body('shippingInfo.address')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address is required'),
  
  body('shippingInfo.city')
    .trim()
    .isLength({ min: 1 })
    .withMessage('City is required'),
  
  body('shippingInfo.state')
    .trim()
    .isLength({ min: 1 })
    .withMessage('State is required'),
  
  body('shippingInfo.zip_code')
    .trim()
    .isLength({ min: 5 })
    .withMessage('ZIP code is required'),
  
  // Payment information validation
  body('paymentInfo.card_last_four')
    .trim()
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('Card last four digits must be 4 numbers'),
  
  body('paymentInfo.card_type')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Card type is required'),
  
  // Custom validation function
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }
    next();
  }
]; 