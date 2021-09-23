import Joi, { CustomHelpers, ErrorReport } from 'joi';

export const sendMailsPayloadSchema = Joi.object({
  rcIdentity: Joi.object({
    flag: Joi.number().required(),
    pubkeyHash: Joi.string().custom(validateHex).length(42).required(),
  }).required(),
  recipients: Joi.array()
    .min(1)
    .items(
      Joi.object({
        sudtId: Joi.string().required(),
        mail: Joi.string().email().max(255).required(),
        amount: Joi.string()
          .pattern(/^(0x)?[0-9]+$/)
          .max(36)
          .required(),
        expiredAt: Joi.number().custom(validateExpireAt, 'expire time should be later than now').required(),
        additionalMessage: Joi.string().allow('').max(2048).required(),
      }),
    )
    .required(),
});

export const claimSudtPayloadSchema = Joi.object({
  claimSecret: Joi.string().length(32).required(),
  address: Joi.string().max(1024).required(),
});

function validateHex(value: string, helpers: CustomHelpers): string | ErrorReport {
  if (value.length < 2 || (value.slice(0, 2) !== '0x' && value.slice(0, 2) !== '0X')) {
    return helpers.message({ custom: 'hash string should start with 0x' });
  }
  Joi.assert(value.slice(2), Joi.string().hex());
  return value;
}

function validateExpireAt(value: number, helpers: CustomHelpers): number | ErrorReport {
  return new Date().getTime() < value
    ? value
    : helpers.message({ custom: 'claim expire time should be later than now' });
}
