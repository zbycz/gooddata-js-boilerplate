%global gdc_prefix /opt

Name:           GDC_REPO_NAME
Version:        3.%{gdcversion}
Release:        1%{dist}
Summary:        GDC_APP_NAME

Group:          Applications/Productivity
License:        Proprietary
URL:            https://github.com/gooddata/GDC_REPO_NAME
Source0:        %{name}.tar.gz
BuildArch:      noarch
BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

Requires:       httpd
BuildRequires:  npm, git

%description
%{summary}

%prep
%setup -q -n %{name} -c

%build
export PATH="$PATH:$PWD/node_modules/.bin/"
. ci/lib.sh
grunt dist

%install
rm -rf $RPM_BUILD_ROOT

mkdir -p $RPM_BUILD_ROOT%{gdc_prefix}/GDC_APP_PATH/
mkdir -p $RPM_BUILD_ROOT%{_sysconfdir}/httpd/conf.d
cp -a dist/* $RPM_BUILD_ROOT%{gdc_prefix}/GDC_APP_PATH/

# httpd configuration
install -d $RPM_BUILD_ROOT%{_sysconfdir}/httpd/conf.d
tar -C httpd -cf - . |tar xf - -C \
    $RPM_BUILD_ROOT%{_sysconfdir}/httpd/conf.d

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(0644,root,root,0755)
%{_sysconfdir}/httpd/conf.d/*
%dir %{gdc_prefix}/GDC_APP_PATH
%{gdc_prefix}/GDC_APP_PATH/*

%changelog
