from copy import deepcopy

from aws_cdk import Environment

from dataclasses import dataclass
from dataclasses import field

from infrastructure.constructs.existing import igvf_dev
from infrastructure.constructs.existing import igvf_prod

from infrastructure.constructs.existing.types import ExistingResourcesClass


from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple


config: Dict[str, Any] = {
    'pipeline': {
        'demo': {
            'pipeline': 'DemoDeploymentPipelineStack',
            'existing_resources_class': igvf_dev.Resources,
            'account_and_region': igvf_dev.US_WEST_2,
            'tags': [
                ('time-to-live-hours', '60'),
                ('turn-off-on-friday-night', 'yes'),
            ],
        },
        'dev': {
            'pipeline': 'DevDeploymentPipelineStack',
            'existing_resources_class': igvf_dev.Resources,
            'account_and_region': igvf_dev.US_WEST_2,
            'tags': [
            ],
        },
        'production': {
            'pipeline': 'ProductionDeploymentPipelineStack',
            'cross_account_keys': True,
            'existing_resources_class': igvf_prod.Resources,
            'account_and_region': igvf_prod.US_WEST_2,
            'tags': [
            ],
        },
    },
    'environment': {
        'demo': {
            'redis': {
                'clusters': [
                    {
                        'construct_id': 'Redis71',
                        'on': True,
                        'props': {
                            'cache_node_type': 'cache.t4g.small',
                            'engine_version': '7.1',
                        }
                    },
                ],
            },
            'frontend': {
                'cpu': 1024,
                'memory_limit_mib': 2048,
                'max_capacity': 4,
                'use_redis_named': 'Redis71',
            },
            'waf': {
                'enabled': True,
                'arn': 'arn:aws:wafv2:us-west-2:109189702753:regional/webacl/IgvfUiDemoWaf-HGyhnH6Z5X0B/84cce4ee-629b-41e1-9918-feb83b50f187',
            },
            'tags': [
                ('time-to-live-hours', '60'),
                ('turn-off-on-friday-night', 'yes'),
            ],
        },
        'dev': {
            'redis': {
                'clusters': [
                    {
                        'construct_id': 'Redis71',
                        'on': True,
                        'props': {
                            'cache_node_type': 'cache.t4g.small',
                            'engine_version': '7.1',
                        }
                    },
                ],
            },
            'frontend': {
                'cpu': 1024,
                'memory_limit_mib': 2048,
                'max_capacity': 4,
                'use_redis_named': 'Redis71',
            },
            'waf': {
                'enabled': True,
                'arn': 'arn:aws:wafv2:us-west-2:109189702753:regional/webacl/IgvfUiDemoWaf-HGyhnH6Z5X0B/84cce4ee-629b-41e1-9918-feb83b50f187',
            },
            'backend_url': 'https://igvfd-dev.demo.igvf.org',
            'tags': [
            ],
        },
        'staging': {
            'redis': {
                'clusters': [
                    {
                        'construct_id': 'Redis71',
                        'on': True,
                        'props': {
                            'cache_node_type': 'cache.t4g.small',
                            'engine_version': '7.1',
                        }
                    },
                ],
            },
            'frontend': {
                'cpu': 1024,
                'memory_limit_mib': 2048,
                'max_capacity': 4,
                'use_redis_named': 'Redis71',
            },
            'waf': {
                'enabled': True,
                'arn': 'arn:aws:wafv2:us-west-2:920073238245:regional/webacl/IgvfUiStagingWaf-WnewgDLfB3IZ/4f006eae-a919-4b1f-a613-b1c7d035c7f1',
            },
            'backend_url': 'https://api.staging.igvf.org',
            'use_subdomain': False,
            'tags': [
            ],
        },
        'sandbox': {
            'redis': {
                'clusters': [
                    {
                        'construct_id': 'Redis71',
                        'on': True,
                        'props': {
                            'cache_node_type': 'cache.t4g.small',
                            'engine_version': '7.1',
                        }
                    },
                ],
            },
            'frontend': {
                'cpu': 1024,
                'memory_limit_mib': 2048,
                'max_capacity': 4,
                'use_redis_named': 'Redis71',
            },
            'waf': {
                'enabled': True,
                'arn': 'arn:aws:wafv2:us-west-2:920073238245:regional/webacl/IgvfUiSandboxWaf-Cerl8Iy9s9Np/6f4843e4-4f8b-4ba5-b384-a1f02f29f0fc',
            },
            'backend_url': 'https://api.sandbox.igvf.org',
            'use_subdomain': False,
            'tags': [
            ],
        },
        'production': {
            'redis': {
                'clusters': [
                    {
                        'construct_id': 'Redis71',
                        'on': True,
                        'props': {
                            'cache_node_type': 'cache.t4g.small',
                            'engine_version': '7.1',
                        }
                    },
                ],
            },
            'frontend': {
                'cpu': 1024,
                'memory_limit_mib': 2048,
                'max_capacity': 4,
                'use_redis_named': 'Redis71',
            },
            'waf': {
                'enabled': True,
                'arn': 'arn:aws:wafv2:us-west-2:035226225042:regional/webacl/IgvfUiProdWaf-xj9DJbn3w2dx/180d8c06-6708-4f18-a7d2-c3c1d09c7019',
            },
            'backend_url': 'https://api.data.igvf.org',
            'use_subdomain': False,
            'tags': [
            ],
        },
    }
}


@dataclass
class Common:
    organization_name: str = 'igvf-dacc'
    project_name: str = 'igvf-ui'
    default_region: str = 'us-west-2'
    aws_cdk_version: str = '2.1031.2'


@dataclass
class Config:
    name: str
    branch: str
    backend_url: str
    redis: Dict[str, Any]
    frontend: Dict[str, Any]
    waf: Dict[str, Any]
    tags: List[Tuple[str, str]]
    url_prefix: Optional[str] = None
    use_subdomain: bool = True
    common: Common = field(
        default_factory=Common
    )


@dataclass
class PipelineConfig:
    name: str
    branch: str
    pipeline: str
    existing_resources_class: ExistingResourcesClass
    account_and_region: Environment
    tags: List[Tuple[str, str]]
    cross_account_keys: bool = False
    common: Common = field(
        default_factory=Common
    )


def get_raw_config_from_name(name: str, **kwargs: Any) -> Dict[str, Any]:
    return {
        **config['environment'][name],
        **kwargs,
        **{'name': name},
    }


def maybe_add_backend_url(calculated_config: Dict[str, Any]) -> None:
    if 'backend_url' not in calculated_config:
        calculated_config['backend_url'] = get_backend_url_from_branch(
            calculated_config['branch']
        )


def fill_in_calculated_config(raw_config: Dict[str, Any]) -> Dict[str, Any]:
    calculated_config = deepcopy(raw_config)
    maybe_add_backend_url(calculated_config)
    return calculated_config


def config_factory(**kwargs: Any) -> Config:
    return Config(
        **kwargs
    )


def build_config_from_name(name: str, **kwargs: Any) -> Config:
    raw_config = get_raw_config_from_name(name, **kwargs)
    calculated_config = fill_in_calculated_config(raw_config)
    return config_factory(**calculated_config)


def build_pipeline_config_from_name(name: str, **kwargs: Any) -> PipelineConfig:
    return PipelineConfig(
        **{
            **config['pipeline'][name],
            **kwargs,
            **{'name': name},
        }
    )


def get_config_name_from_branch(branch: str) -> str:
    if branch == 'dev':
        return 'dev'
    return 'demo'


def get_pipeline_config_name_from_branch(branch: str) -> str:
    if branch == 'dev':
        return 'dev'
    if branch == 'main':
        return 'production'
    return 'demo'


def get_backend_url_from_branch(branch: str) -> str:
    return f'https://igvfd-{branch}.demo.igvf.org'
