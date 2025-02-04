import { HttpStatus } from '@nestjs/common'
import { ErrorResponse } from '@common/exceptions/app.exception'
export const Errors: Record<string, ErrorResponse> = {
  VALIDATION_FAILED: {
    error: 'VALIDATION_FAILED',
    message: 'Dữ liệu không hợp lệ',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  OBJECT_NOT_FOUND: {
    error: 'OBJECT_NOT_FOUND',
    message: 'Không tìm thấy đối tượng',
    httpStatus: HttpStatus.NOT_FOUND
  },
  WRONG_EMAIL_OR_PASSWORD: {
    error: 'WRONG_EMAIL_OR_PASSWORD',
    message: 'Email or password is incorrect',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  INACTIVE_ACCOUNT: {
    error: 'INACTIVE_ACCOUNT',
    message: 'Your account has been inactive. Please contact with admin.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  EMAIL_ALREADY_EXIST: {
    error: 'EMAIL_ALREADY_EXIST',
    message: 'Email is already existed',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CUSTOMER_NOT_FOUND: {
    error: 'CUSTOMER_NOT_FOUND',
    message: 'Thông tin khách hàng không tồn tại.',
    httpStatus: HttpStatus.NOT_FOUND
  },
  NOT_ENOUGH_QUANTITY_IN_STOCK: {
    error: 'NOT_ENOUGH_QUANTITY_IN_STOCK',
    message: 'Không đủ số lượng trong kho.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_ALREADY_EXIST: {
    error: 'CATEGORY_ALREADY_EXIST',
    message: 'Danh mục đã tồn tại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_NAME_DUPLICATED: {
    error: 'CATEGORY_NAME_DUPLICATED',
    message: 'Tên danh mục đã tồn tại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CATEGORY_NOT_FOUND: {
    error: 'CATEGORY_NOT_FOUND',
    message: 'Không tìm thấy danh mục',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PRODUCT_NOT_FOUND: {
    error: 'PRODUCT_NOT_FOUND',
    message: 'Không tìm thấy sản phẩm',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CART_EMPTY: {
    error: 'CART_EMPTY',
    message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CART_ITEM_INVALID: {
    error: 'CART_ITEM_INVALID',
    message: 'Sản phẩm không có trong giỏ hàng.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_NOT_FOUND: {
    error: 'ORDER_NOT_FOUND',
    message: 'Order is not found!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_ITEMS_INVALID: {
    error: 'ORDER_ITEMS_INVALID',
    message: 'Items in order is invalid',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_STATUS_INVALID: {
    error: 'ORDER_STATUS_INVALID',
    message: 'Đơn hàng không hợp lệ.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  STAFF_NOT_FOUND: {
    error: 'STAFF_NOT_FOUND',
    message: 'Staff is not found.',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CONSULTANT_BOOKING_NOT_FOUND: {
    error: 'CONSULTANT_BOOKING_NOT_FOUND',
    message: 'Không tìm thấy lịch đặt tư vấn. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  CONSULTANT_STAFF_NOT_FOUND: {
    error: 'CONSULTANT_STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên tư vấn. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  DELIVERY_STAFF_NOT_FOUND: {
    error: 'DELIVERY_STAFF_NOT_FOUND',
    message: 'Không tìm thấy nhân viên giao hàng',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  ORDER_HAS_ASSIGNED_DELIVERY: {
    error: 'ORDER_HAS_ASSIGNED_DELIVERY',
    message: 'Đơn hàng đã được giao cho người vận chuyển',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  SHIPPING_TASK_INVALID: {
    error: 'SHIPPING_TASK_INVALID',
    message: 'Công việc được chọn không hợp lệ',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  VISIT_SHOWROOM_BOOKING_NOT_FOUND: {
    error: 'VISIT_SHOWROOM_BOOKING_NOT_FOUND',
    message: 'Không tìm thấy lịch tham quan showroom. Vui lòng thử lại',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  COURSE_EXISTED: {
    error: 'COURSE_EXISTED',
    message: 'Course is already existed!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  COURSE_NOT_FOUND: {
    error: 'COURSE_NOT_FOUND',
    message: 'Course is not found!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  COURSE_ALREADY_ORDERED: {
    error: 'COURSE_ALREADY_ORDERED',
    message: 'Course is already ordered!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PAID_COURSE_MUST_HAVE_POSITIVE_PRICE: {
    error: 'PAID_COURSE_MUST_HAVE_POSITIVE_PRICE',
    message: 'Price of Paid course must be greater than 0!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PAID_COURSE_MUST_HAVE_AT_LEAST_ONE_PAID_LESSON: {
    error: 'PAID_COURSE_MUST_HAVE_AT_LEAST_ONE_PAID_LESSON',
    message: 'Paid course must have at least one paid lesson!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PROVIDER_EXISTED: {
    error: 'PROVIDER_EXISTED',
    message: 'Provider is already existed!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  PROVIDER_NOT_FOUND: {
    error: 'PROVIDER_NOT_FOUND',
    message: 'Provider is not found!',
    httpStatus: HttpStatus.BAD_REQUEST
  },
  MY_COURSE_NOT_FOUND: {
    error: 'COURSE_NOT_FOUND',
    message: 'My Course is not found!',
    httpStatus: HttpStatus.BAD_REQUEST
  }
}
