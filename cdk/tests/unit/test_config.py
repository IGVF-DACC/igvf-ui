import pytest


def test_config_exists():
    from infrastructure.config import config
    assert 'demo' in config['environment']
    assert 'demo' in config['pipeline']


def test_config_common_dataclass():
    from infrastructure.config import Common
    common = Common()
    assert common.organization_name == 'igvf-dacc'
    assert common.project_name == 'igvf-ui'


def test_config_config_dataclass():
    from infrastructure.config import Config
    config = Config(
        name='demo',
        branch='xyz-branch',
        redis={},
        frontend={},
        waf={},
        backend_url='https://test.backend.org',
        tags=[
            ('test', 'tag'),
        ]
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert config.branch == 'xyz-branch'
    assert config.redis == {}
    assert config.frontend == {}
    assert config.waf == {}
    assert config.backend_url == 'https://test.backend.org'
    assert config.tags == [('test', 'tag')]


def test_config_pipeline_config_dataclass():
    from infrastructure.config import PipelineConfig
    from infrastructure.constructs.existing import igvf_dev
    config = PipelineConfig(
        name='demo',
        branch='xyz-branch',
        pipeline='xyz-pipeline',
        existing_resources_class=igvf_dev.Resources,
        account_and_region=igvf_dev.US_WEST_2,
        tags=[
            ('abc', '123'),
            ('xyz', '321'),
        ]
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert config.existing_resources_class == igvf_dev.Resources
    assert config.account_and_region == igvf_dev.US_WEST_2
    assert config.branch == 'xyz-branch'
    assert config.pipeline == 'xyz-pipeline'
    assert config.tags == [
        ('abc', '123'),
        ('xyz', '321'),
    ]


def test_config_build_config_from_name():
    from infrastructure.config import build_config_from_name
    config = build_config_from_name(
        'demo',
        branch='my-branch',
        backend_url='http://my-specific-endpoint.org',
        redis={},
        frontend={},
        waf={}
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert config.branch == 'my-branch'
    assert config.redis == {}
    assert config.frontend == {}
    assert config.waf == {}
    assert config.name == 'demo'
    assert config.backend_url == 'http://my-specific-endpoint.org'
    config = build_config_from_name(
        'dev',
        branch='my-branch',
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert config.branch == 'my-branch'
    assert config.frontend
    assert config.name == 'dev'
    assert config.backend_url == 'https://igvfd-dev.demo.igvf.org'


def test_config_build_config_from_name_demo(mocker):
    from infrastructure.config import build_config_from_name
    mocker.patch(
        'infrastructure.config.get_raw_config_from_name',
        return_value={
            'redis': {},
            'frontend': {},
            'waf': {},
            'branch': 'my-branch',
            'name': 'demo',
            'tags': [('time-to-live-hours', '3')]
        }
    )
    config = build_config_from_name(
        'demo',
        branch='my-branch',
        # Overrides.
        frontend={},
        waf={},
        redis={},
    )
    assert config.backend_url == 'https://igvfd-my-branch.demo.igvf.org'


def test_config_build_pipeline_config_from_name():
    from aws_cdk import Environment
    from infrastructure.constructs.existing import igvf_dev
    from infrastructure.config import build_pipeline_config_from_name
    config = build_pipeline_config_from_name(
        'demo',
        branch='my-branch',
        pipeline='my-pipeline',
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert ('time-to-live-hours', '60') in config.tags
    assert config.branch == 'my-branch'
    assert config.pipeline == 'my-pipeline'
    assert config.name == 'demo'
    config = build_pipeline_config_from_name(
        'dev',
        branch='my-branch',
    )
    assert config.common.organization_name == 'igvf-dacc'
    assert config.common.project_name == 'igvf-ui'
    assert config.pipeline == 'DevDeploymentPipelineStack'
    assert config.name == 'dev'
    assert isinstance(config.account_and_region, Environment)
    assert config.existing_resources_class == igvf_dev.Resources


def test_config_build_config_from_branch():
    from infrastructure.config import get_config_name_from_branch
    config_name = get_config_name_from_branch('IGVF-123-add-new-feature')
    assert config_name == 'demo'
    config_name = get_config_name_from_branch('dev')
    assert config_name == 'dev'


def test_config_get_pipeline_config_name_from_branch():
    from infrastructure.config import get_pipeline_config_name_from_branch
    config_name = get_pipeline_config_name_from_branch(
        'IGVF-123-add-new-feature')
    assert config_name == 'demo'
    config_name = get_pipeline_config_name_from_branch('dev')
    assert config_name == 'dev'
    config_name = get_pipeline_config_name_from_branch('main')
    assert config_name == 'production'


def test_config_get_raw_config_from_name():
    from infrastructure.config import get_raw_config_from_name
    raw_config = get_raw_config_from_name(
        'dev',
        branch='my-branch',
    )
    assert raw_config['branch'] == 'my-branch'
    assert raw_config['frontend']
    assert raw_config['name'] == 'dev'
    assert raw_config['backend_url'] == 'https://igvfd-dev.demo.igvf.org'


def test_config_get_raw_config_from_name_demo():
    from infrastructure.config import get_raw_config_from_name
    raw_config = get_raw_config_from_name(
        'demo',
        branch='my-branch',
        redis={},
        frontend={},
        waf={},
    )
    assert raw_config['branch'] == 'my-branch'
    assert raw_config['frontend'] == {}
    assert raw_config['name'] == 'demo'
    raw_config = get_raw_config_from_name(
        'demo',
        branch='my-branch',
        redis={},
        frontend={},
        waf={},
        backend_url='http://my-specific-endpoint.org',
        tags=[('abc', '123')]
    )
    assert raw_config['branch'] == 'my-branch'
    assert raw_config['frontend'] == {}
    assert raw_config['name'] == 'demo'
    assert raw_config['backend_url'] == 'http://my-specific-endpoint.org'
    assert raw_config['tags'] == [('abc', '123')]


def test_config_maybe_add_backend_url():
    from infrastructure.config import maybe_add_backend_url
    calculated_config = {}
    with pytest.raises(KeyError):
        maybe_add_backend_url(calculated_config)
    calculated_config['branch'] = 'IGVF-my-cool-feature-branch'
    maybe_add_backend_url(calculated_config)
    assert calculated_config['backend_url'] == 'https://igvfd-IGVF-my-cool-feature-branch.demo.igvf.org'
    calculated_config
    calculated_config['branch'] = 'IGVF-my-cool-feature-branch'
    calculated_config['backend_url'] = 'http://someotherendpoint.org'
    maybe_add_backend_url(calculated_config)
    assert calculated_config['backend_url'] == 'http://someotherendpoint.org'


def test_config_fill_in_calculated_config():
    from infrastructure.config import fill_in_calculated_config
    from infrastructure.config import get_raw_config_from_name
    raw_config = get_raw_config_from_name(
        'demo',
        branch='my-branch',
        redis={},
        frontend={},
        waf={},
        tags=[('xyz', '123')],
    )
    raw_config.pop('backend_url', None)
    calculated_config = fill_in_calculated_config(raw_config)
    assert calculated_config == {
        'redis': {},
        'frontend': {},
        'waf': {},
        'branch': 'my-branch',
        'name': 'demo',
        'backend_url': 'https://igvfd-my-branch.demo.igvf.org',
        'tags': [('xyz', '123')]
    }


def test_config_config_factory_init():
    from infrastructure.config import config_factory
    from infrastructure.config import Config
    with pytest.raises(TypeError):
        config = config_factory(a='b')
    kwargs = {
        'name': 'some-name',
        'branch': 'some-branch',
        'redis': {},
        'frontend': {},
        'waf': {},
        'backend_url': 'some-backend-url',
        'tags': [('abc', '123')]
    }
    config = config_factory(**kwargs)
    assert isinstance(config, Config)


def test_config_get_backend_url_from_branch():
    from infrastructure.config import get_backend_url_from_branch
    assert get_backend_url_from_branch(
        'IGVF-my-feature-branch-123'
    ) == 'https://igvfd-IGVF-my-feature-branch-123.demo.igvf.org'
