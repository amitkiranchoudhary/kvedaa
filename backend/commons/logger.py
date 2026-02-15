import logging
import os


def get_file_handler(
    log_name: str, mode: int, formatter: logging.Formatter, save_path: str = "logs"
):
    os.makedirs(save_path, exist_ok=True)
    # file logs
    file_handler = logging.FileHandler(
        filename=os.path.join(save_path, log_name), mode="a"
    )
    file_handler.setLevel(mode)
    file_handler.setFormatter(formatter)
    return file_handler


def config_logger(logger: logging.Logger, debug_mode: bool = True):
    formatter = logging.Formatter(
        "[pid=%(process)s] - [%(asctime)s] - [%(name)s] - [%(levelname)s] - [%(message)s]"
    )
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)

    debug_logger = get_file_handler(
        log_name="debug.log", mode=logging.DEBUG, formatter=formatter
    )

    logger.addHandler(debug_logger)

    logger.setLevel(logging.DEBUG)
    return logger


def logger(_name_):
    logging_obj = config_logger(logging.getLogger(_name_))
    return logging_obj
