def check_demo_config_on_pr():
    from infrastructure.config import config
    assert 'backend_url' not in config['environment']['demo']
    assert config['environment']['demo']['tags'] == [
        ('time-to-live-hours', '71'),
        ('turn-off-on-friday-night', 'yes')]


if __name__ == '__main__':
    check_demo_config_on_pr()
